const debug = require('debug')('exchanges');
const Promise = require('bluebird');
const queue = require('./redis').queue;
const request = require('request-promise');
const ccxt = require('ccxt');
const pickBy = require('lodash.pickby');

const config = require('./config/index');
const Snapshot = require('./models/snapshot.model').Snapshot;

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

          const balancePromises = [];
          debug('Fetching all exchange tickers');
          Object.keys(exchangeConnections).forEach((exchange) => {
            exchangeConnections[exchange].fetchTickers()
              .then((tickers) => {
                let totalAssetValue = 0;
                balancePromises.push(
                  exchangeConnections[exchange]
                    .fetchBalance()
                    .then((balances) => {
                      const parsedBalances = pickBy(balances.total, (val) => {
                        return val > 0;
                      });

                      for (let key in parsedBalances) {
                        if (parsedBalances.hasOwnProperty(key)) {
                          parsedBalances[key] = {
                            total: parsedBalances[key]
                          };
                          const val = tickers[`${key}/BTC`];
                          if (val) {
                            parsedBalances[key].valueBTC = (val.last * parsedBalances[key].total);
                            totalAssetValue += parsedBalances[key].valueBTC;
                          }
                        }
                      }
                      // Add BTC
                      parsedBalances['BTC'].valueBTC = parsedBalances['BTC'].total;
                      totalAssetValue += parsedBalances['BTC'].valueBTC;

                      return new Promise.resolve({
                        name: exchange,
                        balances: parsedBalances,
                        totalAssetValue: totalAssetValue
                      });
                    })
                );

                debug('Fetching all exchange balances');
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
                            totalAssetValue: entry.totalAssetValue
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
