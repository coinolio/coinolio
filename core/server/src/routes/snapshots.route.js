const express = require('express');
const permissions = require('./permissions');
const snapshotsCtrl = require('../controllers/snapshots.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/snapshots - Get list of snapshots */
  .get(permissions.requireLogin, snapshotsCtrl.list);

router.route('/interval/:interval/:duration?')
  /** GET /api/snapshots/interval/:interval/:duration? - Get list of snapshots in internals of minutes over duration of hours */
  .get(permissions.requireLogin, snapshotsCtrl.listInterval);

router.route('/:snapshotId')
  /** GET /api/snapshots/:snapshotId - Get snapshot */
  .get(permissions.requireLogin, snapshotsCtrl.get);

module.exports = router;
