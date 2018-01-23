const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const bcrypt = require('bcryptjs');
const APIError = require('../utils/errors').APIError;

const SALT_WORK_FACTOR = 10;

const User = db.Model.extend(
  {
    tableName: 'users',
    hasTimestamps: true,

    initialize() {
      this.on('creating', this.validateCreate, this);
    },

    validateCreate(model, attrs, options) {
      return User.findOne({}, {require: false})
        .then((user) => {
          if (user) {
            const err = new APIError('Limited to one user', httpStatus.BAD_REQUEST);
            return Promise.reject(err);
          }
          return this.hashPassword(model, attrs, options);
        });
    },

    hashPassword(model, attrs, options) {
      const self = this;
      return new Promise((resolve, reject) => {
        /**
         * CASE: add model, hash password
         * CASE: update model, hash password
         *
         * Important:
         *   - Password hashing happens when we import a database
         *   - we do some pre-validation checks, because onValidate is called AFTER onSaving
         */
        if (self.isNew() || self.hasChanged('password')) {
          self.set('password', String(self.get('password')));
          bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            // hash the password along with our new salt
            if ( err ) {
              reject(err);
            }
            bcrypt.hash(self.get('password'), salt, (err2, hash) => {
              if ( err2 ) {
                reject(err2);
              }
              // override the cleartext password with the hashed one
              self.set('password', hash);
              resolve(hash);
            });
          });
        }
      });
    },

    toJSON(options) {
      options = options || {};

      var attrs = db.Model.prototype.toJSON.call(this, options);
      // remove password hash for security reasons
      delete attrs.password;

      return attrs;
    }
  },
  {
    // Finds the user by username, and checks the password
    authenticate(object) {
      return new Promise((resolve, reject) => {
        var self = this;

        return this.getByUsername(object.username)
          .then((user) => {
            if (!user) {
              const err = new APIError('Username / Password incorrect', httpStatus.NOT_FOUND);
              return reject(err);
            }

            return self.isPasswordCorrect(
              {
                plainPassword: object.password,
                hashedPassword: user.get('password')
              })
              .then(() => {
                return resolve(user);
              })
              .catch((err) => {
                return reject('Username / Password incorrect');
              });
          })
          .catch((err) => {
            if (err.message === 'NotFound' || err.message === 'EmptyResponse') {
              const err = new APIError('Username / Password incorrect', httpStatus.NOT_FOUND);
              return reject(err);
            }
            return reject(err);
          });
      });
    },

    isPasswordCorrect(object) {
      const plainPassword = object.plainPassword;
      const hashedPassword = object.hashedPassword;

      if (!plainPassword || !hashedPassword) {
        return Promise.reject('No password');
      }

      return bcrypt.compare(plainPassword, hashedPassword)
        .then(function(matched) {
          if (matched) {
            return;
          }

          return Promise.reject('Password incorrect');
        });
    },

    getByUsername(username) {
      return User.findOne({username: username}, {require: true})
        .then((user) => {
          if (user) {
            return user;
          }
          const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
          return Promise.reject(err);
        });
    },

    /**
     * Get user
     * @param {ObjectId} id - The objectId of user.
     * @return {Promise<User, APIError>}
     */
    get(id) {
      return User.findById(id, {require: true})
        .then((user) => {
          if (user) {
            return user;
          }
          const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
          return Promise.reject(err);
        });
    }
  }
);

module.exports = {
  User: db.model('User', User)
};
