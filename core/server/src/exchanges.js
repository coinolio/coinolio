const debug = require('debug')('exchanges');
const Promise = require('bluebird');
const kue = require('kue-scheduler');
const queue = kue.createQueue();
const request = require('request-promise');
const ccxt = require('ccxt');
const pickBy = require('lodash.pickby');

const config = require('./config/index');
const Snapshot = require('./models/snapshot.model').Snapshot;


// Exchanges
const bittrex = new ccxt.bittrex({
  apiKey: process.env.BITTREX_KEY,
  secret: process.env.BITTREX_SECRET
});

const activeExchanges = [
  {
    name: 'bittrex',
    apiKey: process.env.BITTREX_KEY,
    secret: process.env.BITTREX_SECRET
  }
];

const exchangeConnections = {};

const exchanges = {
  init() {
    return new Promise((resolve, reject) => {
      debug('Initialising exchanges');
      activeExchanges.forEach((e) => {
        exchangeConnections[e.name] = new ccxt[e.name]({
          apiKey: e.apiKey,
          secret: e.secret
        });
      });
      this.listen();
      resolve();
    });
  },
  bittrex: bittrex,

  listen() {
    debug('Listening for events');
    queue.process('createSnapshot', (job, done) => {
      debug('"createSnapshot" event fired');
      this.createSnapshot()
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  },

  createSnapshot() {
    return new Promise((resolve, reject) => {
      debug('Obtain current BTC price');
      request(`https://api.coindesk.com/v1/bpi/currentprice/${config.currency}.json`)
        .then((res) => {
          res = JSON.parse(res);
          const BTCPrice = res.bpi[config.currency].rate_float;

          debug('Fetching all exchange balances');
          const balancePromises = [];
          Object.keys(exchangeConnections).forEach((exchange) => {
            balancePromises.push(
              exchangeConnections[exchange].fetchBalance()
                .then((balances) => {
                  return new Promise.resolve({
                    name: exchange,
                    balances: pickBy(balances.total, (val) => {
                      return val > 0;
                    })
                  });
                })
            );
            Promise.all(balancePromises)
              .then((res) => {
                const snapshotPromises = [];
                for (let i=0; i < res.length; i++) {
                  const entry = res[i];
                  snapshotPromises.push(Snapshot.create(
                    {
                      exchange: entry.name,
                      snapshot: {
                        balances: entry.balances,
                        BTC: {
                          price: BTCPrice,
                          currency: config.currency
                        },
                        totalAssetValue: 00
                      }
                    })
                    .then(() => {
                      debug(`${res[i].name} snapshot created`);
                    }));
                }
                Promise.all(snapshotPromises)
                  .then((res) => {
                    return resolve(res);
                  })
                  .catch((e) => {
                    console.error(e);
                    return reject(e);
                  });
              });
          });
        });
    });
  }
};

module.exports = exchanges;
