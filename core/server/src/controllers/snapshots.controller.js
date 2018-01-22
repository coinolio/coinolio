const {Snapshot, Snapshots} = require('../models/snapshot.model');

/**
 * Get snapshot
 * @param {*} req - Number of snapshots to be skipped.
 * @param {*} res - Limit number of snapshots to be returned.
 * @returns {Snapshot}
 */
function get(req, res) {
  return res.json(req.snapshot);
}

/**
 * Create new snapshot
 * @param {*} req - Number of snapshots to be skipped.
 * @param {*} res - Limit number of snapshots to be returned.
 * @param {Function} next - Called when complete.
 */
function create(req, res, next) {
  Snapshot.create(
    {
      exchange: req.body.exchange,
      snapshot: req.body.snapshot
    })
    .then(() => {
      return res.json(snapshot.toJSON());
    })
    .catch((e) => {
      next(e);
    });
}

/**
 * Update existing snapshot.
 * @param {*} req - Number of snapshots to be skipped.
 * @param {*} res - Limit number of snapshots to be returned.
 * @param {Function} next - Called when complete.
 */
function update(req, res, next) {
  debug('Unsupported method');
  next();
}

/**
 * Get snapshot list.
 * @param {*} req - Number of snapshots to be skipped.
 * @param {*} res - Limit number of snapshots to be returned.
 * @param {Function} next - Called when complete.
 */
function list(req, res, next) {
  Snapshots.list()
    .then((snapshots) => res.json(snapshots))
    .catch((e) => next(e));
}

/**
 * Delete snapshot.
 * @param {*} req - Number of snapshots to be skipped.
 * @param {*} res - Limit number of snapshots to be returned.
 * @param {Function} next - Called when complete.
 */
function remove(req, res, next) {
  const snapshot = req.snapshot;
  Snapshot.destroy(snapshot)
    .then((deletedSnapshot) => res.json(deletedSnapshot))
    .catch((e) => next(e));
}

module.exports = {get, create, update, list, remove};
