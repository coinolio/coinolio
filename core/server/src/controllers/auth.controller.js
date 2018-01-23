const jwt = require('jsonwebtoken');
const passport = require('passport');
const httpStatus = require('http-status');
const APIError = require('../utils/errors').APIError;
const config = require('../config');

/**
 * Returns jwt token if valid username and password is provided
 * @param req
 * @param res
 * @param next
 * @returns {*}
 */
function login(req, res, next) {
  // attempt to authenticate user
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      const authErr = new APIError('UNAUTHORIZED', httpStatus.UNAUTHORIZED, true);
      return next(authErr);
    } else {
      // handle login success
      const token = jwt.sign({
        id: user.id
      }, config.jwtSecret);

      req.session.user = {
        token,
        id: user.id,
        username: user.username
      };

      res.cookie('user', req.session.user, {maxAge: 900000, httpOnly: true});

      return res.json({
        token,
        id: user.id,
        username: user.username
      });
    }
  })(req, res, next);
}

/**
 * This is a protected route. Will return random number only if jwt token is provided in header.
 * @param req
 * @param res
 * @return {*}
 */
function getRandomNumber(req, res) {
  // req.user is assigned by jwt middleware if valid token is provided
  return res.json({
    user: req.user,
    num: Math.random() * 100
  });
}

module.exports = {login, getRandomNumber};
