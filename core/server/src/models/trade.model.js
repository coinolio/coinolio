const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Trade = db.Model.extend({
  tableName: 'trades',
  idAttribute: 'tran_id',
  hasTimestamps: false
}, {
  /**
   * Get trade
   * @param {string} id - The ID of trade.
   * @return {Promise}
   */
  get(id) {
    return Trade.findById(id,
      {
        require: true
      })
      .then((trade) => {
        if (trade) {
          trade = trade.toJSON({omitPivot: true});
          return trade;
        }
        const err = new APIError(
          'No such trade exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  }
});

const Trades = db.Collection.extend({
  model: Trade
}, {
  /**
   * List trades in descending order of 'created_at' timestamp.

   * @return {Promise}
   */
  list() {
    return Trades
      .query((qb) => {
        qb
          .select();
      })
      .orderBy('datetime', 'DESC')
      .fetch();
  }
});

module.exports = {
  Trade: db.model('Trade', Trade),
  Trades: db.collection('Trades', Trades)
};
