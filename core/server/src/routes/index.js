const express = require('express');
const router = new express.Router();

const usersRoutes = require('./users.route');
const snapshotsRoutes = require('./snapshots.route');

router.get('/', (req, res) => {
  res.status(200).send('Welcome to Coinolio API!');
});

// mount user routes at /users
router.use('/users', usersRoutes);

// mount user routes at /snapshots
router.use('/snapshots', snapshotsRoutes);

module.exports = router;
