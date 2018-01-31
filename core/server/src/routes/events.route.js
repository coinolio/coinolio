const express = require('express');
const validate = require('express-validation');
const paramValidation = require('../config/param-validation');
const permissions = require('./permissions');
const eventsCtrl = require('../controllers/events.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/events - Get list of events */
  .get(permissions.requireLogin, eventsCtrl.list)

  /** POST /api/events - Create new event */
  .post(permissions.requireLogin, validate(paramValidation.createEvent), eventsCtrl.create);

router.route('/:eventId')
  /** GET /api/events/:eventId - Get event */
  .get(permissions.requireLogin, eventsCtrl.get)

  /** PUT /api/events/:eventId - Update event */
  .put(permissions.requireLogin, validate(paramValidation.updateEvent), eventsCtrl.update);

/** Load event when API with eventId route parameter is hit */
router.param('eventId', eventsCtrl.load);

module.exports = router;
