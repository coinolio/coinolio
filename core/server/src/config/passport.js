const config = require('./index');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const passportLocal = require('passport-local');
const passportBearer = require('passport-http-bearer');
const httpStatus = require('http-status');
const APIError = require('../utils/errors').APIError;

const LocalStrategy = passportLocal.Strategy;
const BearerStrategy = passportBearer.Strategy;

const {User} = require('../models/user.model');


passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.get(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err);
    });
});

/**
 * Sign in using Email and Password.
 */
passport.use(new LocalStrategy({usernameField: 'username'}, (username, password, done) => {
  User.authenticate({username, password})
    .then((user) => {
      if (!user) {
        return done(null, false, {msg: `User ${username} not found.`});
      }

      return done(null, user.toJSON());
    })
    .catch((reason) => {
      const authErr = new APIError('Username or Password incorrect', httpStatus.UNAUTHORIZED, true);
      return done(authErr, false);
    });
}));

passport.use(new BearerStrategy((token, cb) => {
  jwt.verify(token, config.jwtSecret, (err, decoded) => {
    if (err) {
      return cb(err);
    }
    User.get(decoded.id)
      .then((user) => {
        return cb(null, user ? user : false);
      });
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = (req, res, next) => {
  passport.authenticate('bearer', function(err, user, info) {
    if (err) {
      return next(err);
    };
    if (user) {
      req.user = user;
      return next();
    } else {
      const authErr = new APIError('UNAUTHORIZED', httpStatus.UNAUTHORIZED, true);
      return next(authErr, false);
    }
  })(req, res, next);
};

/**
 * Authorization Required middleware.
 */
exports.isAuthorized = (req, res, next) => {
  const provider = req.path.split('/').slice(-1)[0];
  const token = req.user.tokens.find((token) => token.kind === provider);
  if (token) {
    next();
  }
};
