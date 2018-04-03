const express = require('express');
const permissions = require('./permissions');
const currenciesCtrl = require('../controllers/currencies.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/currencies - Get list of currencies */
  .get(permissions.requireLogin, currenciesCtrl.list);

router.route('/refresh')
  /** GET /api/currencies - Get list of currencies */
  .get(permissions.requireLogin, currenciesCtrl.refreshCurrencies);

router.route('/:currencyId')
  /** GET /api/currencies/:currencyId - Get currency */
  .get(permissions.requireLogin, currenciesCtrl.get);

router.route('/:currencyId/refresh')
  /** GET /api/currencies/:currencyId - Get currency */
  .get(permissions.requireLogin, currenciesCtrl.updateCurrency);

/** Load currency when API with currencyId route parameter is hit */
router.param('currencyId', currenciesCtrl.load);

module.exports = router;
