const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../config/param-validation');
const permissions = require('./permissions');
const pluginsCtrl = require('../controllers/plugins.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/plugins - Get list of plugins */
  .get(permissions.requireLogin, pluginsCtrl.list)

  /** POST /api/plugins - Create new plugin */
  .post(permissions.requireLogin, validate(paramValidation.createPlugin), pluginsCtrl.create);

router.route('/:pluginId')
  /** GET /api/plugins/:pluginId - Get plugin */
  .get(permissions.requireLogin, pluginsCtrl.get)

  /** PUT /api/plugins/:pluginId - Update plugin */
  .put(permissions.requireLogin, validate(paramValidation.updatePlugin), pluginsCtrl.update);

/** Load plugin when API with pluginId route parameter is hit */
router.param('pluginId', pluginsCtrl.load);

module.exports = router;
