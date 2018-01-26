const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../config/param-validation');
const permissions = require('./permissions');
const tradesCtrl = require('../controllers/trades.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/trades - Get list of trades */
  .get(permissions.requireLogin, tradesCtrl.list)

  /** POST /api/trades - Create new trade */
  .post(permissions.requireLogin, validate(paramValidation.createTrade), tradesCtrl.create);

router.route('/:tradeId')
  /** GET /api/trades/:tradeId - Get trade */
  .get(permissions.requireLogin, tradesCtrl.get)

  /** PUT /api/trades/:tradeId - Update trade */
  .put(permissions.requireLogin, validate(paramValidation.updateTrade), tradesCtrl.update);

/** Load trade when API with tradeId route parameter is hit */
router.param('tradeId', tradesCtrl.load);

module.exports = router;
