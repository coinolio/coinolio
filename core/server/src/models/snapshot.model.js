const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Snapshot = db.Model.extend({
  tableName: 'snapshots',
  idAttribute: 'time',
  hasTimestamps: true
}, {
  /**
   * Get snapshot
   * @param {string} time - The timestamp of snapshot.
   * @return {Promise}
   */
  get(time) {
    return Snapshot.findWhere(
      {
        time: time
      })
      .then((snapshot) => {
        if (snapshot) {
          snapshot = snapshot.toJSON({omitPivot: true});
          return snapshot;
        }
        const err = new APIError(
          'No such snapshot exists!',
          httpStatus.NOT_FOUND
        );
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
   * @return {Promise}
   */
  list({exchange = null, limit = 60} = {}) {
    return Snapshots
      .query((qb) => {
        qb
          .limit(limit)
          .select();
      })
      .orderBy('created_at', 'DESC')
      .fetch();
  },

  /**
   * Get list of asset values in intervals over a certain duration of hours
   * @param {number} interval - The interval of data entried
   * @param {number} duration - The duration of time analysed
   * @return {Promise}
   */
  listInterval({interval = 10, duration = 24} = {}) {
    return db.knex.raw(`
      SELECT time_bucket('${interval} minutes', time) AS time_bucket_start,
      COUNT(*) as entries,
      MAX((snapshot->>'totalAssetValue')::numeric) AS max_assetValue,
      MIN((snapshot->>'totalAssetValue')::numeric) AS min_assetValue,
      AVG((snapshot->>'totalAssetValue')::numeric) AS avg_assetValue
      FROM snapshots
      WHERE time > NOW() - interval '${duration} hours'
      GROUP BY time_bucket_start
      ORDER BY time_bucket_start DESC, avg_assetValue DESC;
    `);
  }
});

module.exports = {
  Snapshot: db.model('Snapshot', Snapshot),
  Snapshots: db.collection('Snapshots', Snapshots)
};
