const express = require('express');
const permissions = require('./permissions');
const snapshotsCtrl = require('../controllers/snapshots.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/snapshots - Get list of snapshots */
  .get(permissions.requireLogin, snapshotsCtrl.list);

router.route('/summary/:interval/:duration?')
  /** GET /api/snapshots/summary/:interval/:duration? - Get list of snapshots in summary intervals of minutes over duration of hours */
  .get(permissions.requireLogin, snapshotsCtrl.listInterval);

router.route('/:snapshotId')
  /** GET /api/snapshots/:snapshotId - Get snapshot */
  .get(permissions.requireLogin, snapshotsCtrl.get)

  /** DELETE /api/snapshots/:snapshotId - Delete snapshot */
  .delete(permissions.requireLogin, snapshotsCtrl.remove);

/** Load snapshot when API with snapshotId route parameter is hit */
router.param('snapshotId', snapshotsCtrl.load);

module.exports = router;
