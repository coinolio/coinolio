const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../config/param-validation');
const permissions = require('./permissions');
const userCtrl = require('../controllers/users.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** POST /api/users - Create new user */
  .post(validate(paramValidation.createUser), userCtrl.create);

router.route('/:userId')
  /** GET /api/users/:userId - Get user */
  .get(userCtrl.get)

  /** PUT /api/users/:userId - Update user */
  .put(permissions.requireLogin, validate(paramValidation.updateUser), userCtrl.update);

/** Load user when API with userId route parameter is hit */
router.param('userId', userCtrl.load);

module.exports = router;
