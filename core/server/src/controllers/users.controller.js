const {User} = require('../models/user.model');

/**
 * Load user and append to req.
 * @param {*} req
 * @param {*} res
 * @param {Function} next
 * @param {number} id - ID of the user to fetch
 */
function load(req, res, next, id) {
  User.get(id)
    .then((user) => {
      req.user = user;
      return next();
    })
    .catch((e) => next(e));
}

/**
 * Get user
 * @param {*} req
 * @param {*} res
 * @returns {User}
 */
function get(req, res) {
  return res.json(req.user);
}

/**
 * Create new user
 *
 * @param {*} req
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 * @property {string} req.body.email - The email of user.
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function create(req, res, next) {
  User.create(
    {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password
    })
    .then((user) => {
      return res.json(user.toJSON());
    })
    .catch((e) => {
      next(e);
    });
}

/**
 * Update existing user
 * @param {*} req
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.password - The password of user.
 * @property {string} req.body.email - The email of user.
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function update(req, res, next) {
  const user = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    username: req.body.username,
    email: req.body.email,
    password: req.body.password
  };

  User
    .update(user, {id: req.user.id})
    .then((savedUser) => res.json(savedUser))
    .catch((e) => next(e));
}

module.exports = {load, get, create, update};
