const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Exchange = db.Model.extend({
  tableName: 'exchanges',
  hasTimestamps: true
}, {
  /**
   * Get exchange
   * @param {string} id - The ID of exchange.
   * @return {Promise}
   */
  get(id) {
    return Exchange.findById(id,
      {
        require: true
      })
      .then((exchange) => {
        if (exchange) {
          exchange = exchange.toJSON({omitPivot: true});
          return exchange;
        }
        const err = new APIError(
          'No such exchange exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * Get exchange by name
   * @param {string} name - The nane of exchange.
   * @return {Promise}
   */
  getByName(name) {
    return Exchange.findWhere(
      {
        name: name
      })
      .then((exchange) => {
        if (exchange) {
          exchange = exchange.toJSON({omitPivot: true});
          return exchange;
        }
        const err = new APIError(
          'No such exchange exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  }
});

const Exchanges = db.Collection.extend({
  model: Exchange
}, {
  /**
   * List exchanges in descending order of 'created_at' timestamp.

   * @return {Promise}
   */
  list() {
    return Exchanges
      .query((qb) => {
        qb
          .select();
      })
      .orderBy('created_at', 'DESC')
      .fetch();
  }
});

module.exports = {
  Exchange: db.model('Exchange', Exchange),
  Exchanges: db.collection('Exchanges', Exchanges)
};
