const Promise = require('bluebird');
const redisStore = require('../redis').client;

const Currency = {
  /**
   * Get currency
   * @param {string} symbol - The symbol of currency.
   * @return {Promise}
   */
  get(symbol) {
    return new Promise((resolve, reject) => {
      redisStore.hmget('currencies', symbol.toUpperCase(), (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(JSON.parse(reply));
      });
    });
  },

  updateCurrency(symbol, data) {
    return new Promise((resolve, reject) => {
      redisStore.hmset('currencies', symbol, data, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
};

const Currencies = {
  /**
   * List currencies in descending order of 'created_at' timestamp.

   * @return {Promise}
   */
  list() {
    return new Promise((resolve, reject) => {
      redisStore.hmget('currencies', 'available', (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(JSON.parse(reply || []));
      });
    });
  },

  updateCurrencies(currencies) {
    return new Promise((resolve, reject) => {
      redisStore.hmset('currencies', 'available', currencies, (err, reply) => {
        if (err) {
          return reject(err);
        }
        resolve(reply);
      });
    });
  }
};

module.exports = {
  Currency,
  Currencies
};
