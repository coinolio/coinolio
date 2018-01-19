const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Snapshot = db.Model.extend({
  tableName: 'snapshots',
  hasTimestamps: true
}, {
  /**
   * Get snapshot
   * @param {ObjectId} id - The objectId of snapshot.
   * @return {Promise<Snapshot, APIError>}
   */
  get(id) {
    return Snapshot.findById(id,
      {
        require: true
      })
      .then((snapshot) => {
        if (snapshot) {
          snapshot = snapshot.toJSON({omitPivot: true});
          return snapshot;
        }
        const err = new APIError('No such snapshot exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  }
});

const Snapshots = db.Collection.extend({
  model: Snapshot
}, {
  /**
   * List snapshots in descending order of 'created_at' timestamp.
   * @param {number} skip - Number of snapshots to be skipped.
   * @param {number} limit - Limit number of snapshots to be returned.
   * @return {Promise<Subscription[]>}
   */
  list({exchange = null} = {}) {
    if (userId) {
      return Snapshots
        .query((qb) => {
          qb
            // .where({
            //   'exchange': exchange
            // })
            .select();
        })
        .orderBy('created_at', 'DESC')
        .fetch();
    } else {
      return Snapshots
        .query((qb) => {
          qb.select();
        })
        .orderBy('created_at', 'DESC')
        .fetch();
    }
  }
});

function sizeURL(path, size) {
  return path.replace('{s}', size);
};
module.exports = {
  Snapshot: db.model('Snapshot', Snapshot),
  Snapshots: db.collection('Snapshots', Snapshots)
};
