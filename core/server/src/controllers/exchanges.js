const httpStatus = require('http-status');
const APIError = require('../utlis/errors').APIError;
const Collection = require('../models/exchange.model');

/**
 * Load exchange and append to req.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {requestCallback} next
 * @param {any} id
 */
function load(req, res, next, id) {
  Exchange.get(id)
    .then((exchange) => {
      req.exchange = exchange; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch((e) => next(e));
}

/**
 * Get exchange
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Exchange}
 */
function get(req, res) {
  return res.json(req.exchange);
}

/**
 * Create new exchange
 * @param {Object} req
 * @property {string} req.body.title - The title of exchange.
 * @property {string} req.body.description - The description of exchange.
 * @property {number} req.body.visibility - The visibility of exchange.
 * @property {array} req.body.exchanges - The content of exchange.
 * @property {array} req.body.photos - The photos of exchange.
 * @param {Object} res
 * @param {requestCallback} next
 *
 * @returns {Exchange}
 */
function create(req, res, next) {
  let exchange = {
    name: req.body.name || '',
    options: req.body.options || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (!req.session.user || !req.body.name) {
    const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
    return next(authErr);
  }

  User.get(req.session.user.id)
    .then((user) => {
      if (!user) {
        const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
        return next(authErr);
      }

      Exchange.create(exchange)
        .then((results) => {
          return res.json(results);
        })
        .catch((e) => next(e));
    })
    .catch((err) => {
      const authErr = new APIError('UNAUTHORIZED', httpStatus.UNAUTHORIZED, true);
      return next(authErr);
    });
}

/**
 * Update existing exchange
 *
 * @param {Object} req
 * @property {string} req.body.title - The title of exchange.
 * @property {string} req.body.description - The description of exchange.
 * @property {number} req.body.visibility - The visibility of exchange.
 * @param {Object} res
 * @param {requestCallback} next
 * @returns {Exchange}
 */
function update(req, res, next) {
  const exchange = {
    name: req.body.name || '',
    options: req.body.options || {}
  };

  if (!req.session.user || !req.body.name) {
    const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
    return next(authErr);
  }

  User.get(req.session.user.id)
    .then((user) => {
      if (!user) {
        const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
        return next(authErr);
      }
      Exchange
        .update(exchange, {id: req.exchange.id})
        .then(() => {
          return Exchange.get(req.exchange.id);
        })
        .then((exchange) => {
          return res.json(exchange);
        })
        .catch((e) => next(e));
    });
}

/**
 * Get users exchange list.
 *
 * @param {Object} req
 * @property {number} req.query.skip - Number of exchanges to be skipped.
 * @property {number} req.query.limit - Limit number of exchanges to be returned.
 * @param {Object} res
 * @param {requestCallback} next
 * @returns {Exchange[]}
 */
function list(req, res, next) {
  if (!req.session.user) {
    const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
    return next(authErr);
  }

  const {limit = 50, skip = 0} = req.query;
  const userId = req.session.user.id;
  Exchanges.list({limit, skip, userId})
    .then((exchanges) => res.json(exchanges.toJSON({omitPivot: true})))
    .catch((e) => next(e));
}

/**
 * Delete exchange.
 *
 * @param {Object} req
 * @param {Object} res
 * @param {requestCallback} next
 * @returns {Exchange}
 */
function remove(req, res, next) {
  const exchange = req.exchange;

  if (!req.session.user) {
    const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
    return next(authErr);
  }

  User.get(req.session.user.id)
    .then((user) => {
      if (!user) {
        const authErr = new APIError('Bad Request', httpStatus.BAD_REQUEST, true);
        return next(authErr);
      }

      Collection.destroy(exchange)
        .then((deletedCollection) => {
          return res.json(deletedCollection);
        })
        .catch((e) => next(e));
    });
}

module.exports = {load, get, create, update, createPhotos, removePhotos, list, listAll, remove};
