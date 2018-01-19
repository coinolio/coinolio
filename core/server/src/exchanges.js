const debug = require('debug')('exchanges');
const Promise = require('bluebird');
const kue = require('kue-scheduler');
const queue = kue.createQueue();

// Exchanges
const bittrex = require('./exchanges/bittrex')({
  key: process.env.BITTREX_KEY,
  secret: process.env.BITTREX_SECRET
});

const exchanges = {
  init() {
    debug('Initialising exchanges');
    return new Promise((resolve, reject) => {
      return bittrex.init()
        .then(() => {
          this.listen();
          resolve();
        });
    });
  },
  bittrex: bittrex,

  listen() {
    debug('Listening for events');
    queue.process('getBalance', (job, done) => {
      debug('"getBalance" event fired');
      bittrex.fetchBalances()
        .then((res) => {
          debug('Balance', res.availableCurrencies);
          done();
        });
    });
  }
};

module.exports = exchanges;
