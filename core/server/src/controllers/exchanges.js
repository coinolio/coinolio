const debug = require('debug')('exchanges');
const Promise = require('bluebird');

// Exchanges
const bittrex = require('../exchanges/bittrex')({
  key: process.env.BITTREX_KEY,
  secret: process.env.BITTREX_SECRET
});

const exchanges = {
  init() {
    debug('Initialising exchanges');
    return new Promise((resolve, reject) => {
      bittrex.init()
        .then(() => {
          resolve();
        });
    });
  }
};

module.exports = exchanges;
