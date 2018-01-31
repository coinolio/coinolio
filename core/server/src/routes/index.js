const express = require('express');
const router = new express.Router();

const usersRoutes = require('./users.route');
const authRoutes = require('./auth.route');
const snapshotsRoutes = require('./snapshots.route');
const exchangesRoutes = require('./exchanges.route');
const tradesRoutes = require('./trades.route');
const pluginsRoutes = require('./plugins.route');
const eventsRoutes = require('./events.route');

router.get('/', (req, res) => {
  res.status(200).send('Welcome to Coinolio API!');
});

// mount user routes at /users
router.use('/users', usersRoutes);

// mount user routes at /auth
router.use('/auth', authRoutes);

// mount user routes at /snapshots
router.use('/snapshots', snapshotsRoutes);

// mount user routes at /exchanges
router.use('/exchanges', exchangesRoutes);

// mount user routes at /trades
router.use('/trades', tradesRoutes);

// mount user routes at /plugins
router.use('/plugins', pluginsRoutes);

// mount user routes at /events
router.use('/events', eventsRoutes);

module.exports = router;
