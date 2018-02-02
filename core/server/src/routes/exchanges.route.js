const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../config/param-validation');
const permissions = require('./permissions');
const exchangesCtrl = require('../controllers/exchanges.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/exchanges - Get list of exchanges */
  .get(permissions.requireLogin, exchangesCtrl.list)

  /** POST /api/exchanges - Create new exchange */
  .post(permissions.requireLogin, validate(paramValidation.createExchange), exchangesCtrl.create);

router.route('/valid')
  /** GET /api/exchanges/valid - Get list of valid exchange */
  .get(exchangesCtrl.valid);

router.route('/:exchangeId')
  /** GET /api/exchanges/:exchangeId - Get exchange */
  .get(permissions.requireLogin, exchangesCtrl.get)

  /** PUT /api/exchanges/:exchangeId - Update exchange */
  .put(permissions.requireLogin, validate(paramValidation.updateExchange), exchangesCtrl.update)

  /** DELETE /api/exchanges/:exchangeId - Delete exchange */
  .delete(permissions.requireLogin, exchangesCtrl.remove);

/** Load exchange when API with exchangeId route parameter is hit */
router.param('exchangeId', exchangesCtrl.load);

module.exports = router;
