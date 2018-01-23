const express = require('express');
const snapshotsCtrl = require('../controllers/snapshots.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/snapshots - Get list of snapshots */
  .get(snapshotsCtrl.list);

router.route('/interval/:interval/:duration?')
  /** GET /api/snapshots/interval/:interval/:duration? - Get list of snapshots in internals of minutes over duration of hours */
  .get(snapshotsCtrl.listInterval);

router.route('/:snapshotId')
  /** GET /api/snapshots/:snapshotId - Get snapshot */
  .get(snapshotsCtrl.get);

module.exports = router;
