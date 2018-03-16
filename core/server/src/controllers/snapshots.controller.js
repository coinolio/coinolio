const {Snapshot, Snapshots} = require('../models/snapshot.model');

/**
 * Load snapshot and append to req.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} id - The id of the snapshot to load.
 */
function load(req, res, next, id) {
  Snapshot.get(id)
    .then((snapshot) => {
      req.snapshot = snapshot; // eslint-disable-line no-param-reassign
      return next();
    })
    .catch((e) => next(e));
}

/**
 * Get snapshot
 * @param {*} req
 * @param {*} res
 * @returns {Snapshot}
 */
function get(req, res) {
  return res.json(req.snapshot);
}

/**
 * Create new snapshot
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function create(req, res, next) {
  Snapshot.create(
    {
      exchange: req.body.exchange,
      snapshot: req.body.snapshot
    })
    .then((snapshot) => {
      return res.json(snapshot.toJSON());
    })
    .catch((e) => {
      next(e);
    });
}

/**
 * Update existing snapshot.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function update(req, res, next) {
  debug('Unsupported method');
  next();
}

/**
 * Get snapshot list.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function list(req, res, next) {
  const {limit = 60, skip = 0} = req.query;
  Snapshots.list({limit, skip})
    .then((snapshots) => res.json(snapshots.rows))
    .catch((e) => next(e));
}

/**
 * Get snapshot list by interval.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function listInterval(req, res, next) {
  Snapshots.listInterval({
    interval: req.params.interval,
    duration: req.params.duration
  })
    .then((snapshots) => res.json(snapshots.rows))
    .catch((e) => next(e));
}

/**
 * Delete snapshot.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function remove(req, res, next) {
  Snapshot.destroy({id: req.snapshot.time})
    .then((deletedSnapshot) => res.json(deletedSnapshot))
    .catch((e) => next(e));
}

module.exports = {load, get, create, update, list, listInterval, remove};
