const express = require('express');
const snapshotsCtrl = require('../controllers/snapshots.controller');

const router = express.Router(); // eslint-disable-line new-cap

router.route('/')
  /** GET /api/snapshots - Get list of snapshots */
  .get(snapshotsCtrl.list);

router.route('/:snapshotId')
  /** GET /api/snapshots/:snapshotId - Get snapshot */
  .get(snapshotsCtrl.get);

module.exports = router;
