const express = require('express');
const router = new express.Router();

const snapshotsRoutes = require('./snapshots.route');

router.get('/', (req, res) => {
  res.status(200).send('Welcome to Coinolio!');
});

// mount user routes at /snapshots
router.use('/snapshots', snapshotsRoutes);

module.exports = router;
