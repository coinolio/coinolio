const debug = require('debug')('exchanges');
const Promise = require('bluebird');
const queue = require('./redis').queue;
const request = require('request-promise');
const ccxt = require('ccxt');
const pickBy = require('lodash.pickby');

const config = require('./config/index');
const Exchanges = require('./models/exchange.model').Exchanges;
const Snapshot = require('./models/snapshot.model').Snapshot;

let exchangeConnections = {};

const exchanges = {
  init() {
    debug('Initialising exchanges');
    return new Promise((resolve, reject) => {
      this.loadExchanges()
        .then(() => {
          this.listen();
          resolve();
        })
        .catch((err) => {
          return reject(err);
        });
    });
  },

  listen() {
    debug('Listening for events');
    queue.process('refreshExchanges', (job, done) => {
      debug('"refreshExchanges" event fired');
      this.loadExchanges()
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });

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

  loadExchanges() {
    debug('Loading active exchanges');
    exchangeConnections = {};
    return new Promise((resolve, reject) => {
      Exchanges.list()
        .then((exchanges) => {
          const parsed = exchanges.toJSON().filter((e) => {
            return e.enabled;
          });
          if (parsed.length === 0) {
            console.error('No exchanges available. Please add an exchange or enable an existing.');
            return resolve();
          }
          parsed.forEach((e) => {
            const name = e.name.toLowerCase();
            exchangeConnections[name] = new ccxt[name](e.config);
          });
          return resolve();
        })
        .catch((e) => {
          console.error(e);
          return reject(e);
        });
    });
  },

  createSnapshot() {
    debug('Creating snapshot');
    return new Promise((resolve, reject) => {
      debug('Obtain current BTC price');
      request(`https://api.coindesk.com/v1/bpi/currentprice/${config.currency}.json`)
        .then((res) => {
          res = JSON.parse(res);
          const BTCPrice = res.bpi[config.currency].rate_float;

          debug('Building snapshots');
          if (Object.keys(exchangeConnections).length > 0) {
            const snapshotPromises = Object.keys(exchangeConnections)
              .map((exchange) => {
                return new Promise((resolve, reject) => {
                  debug(`Fetching ${exchange} tickers`);
                  exchangeConnections[exchange].fetchTickers()
                    .then((tickers) => {
                      let totalAssetValue = 0;
                      debug(`Fetching ${exchange} balances`);
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
                          if (parsedBalances['BTC']) {
                            parsedBalances['BTC'].valueBTC = parsedBalances['BTC'].total;
                            totalAssetValue += parsedBalances['BTC'].valueBTC;
                          }

                          return new Promise.resolve({
                            name: exchange,
                            balances: parsedBalances,
                            totalAssetValue: totalAssetValue
                          });
                        })
                        .then((entry) => {
                          debug(`Building ${entry.name} snapshot`);
                          Snapshot.create(
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
                              debug(`${entry.name} snapshot created`);
                              resolve();
                            });
                        })
                        .catch((e) => {
                          console.error(e);
                          reject(e);
                        });
                    });
                });
              });
            debug('Creating all snapshots..', snapshotPromises.length);
            Promise.all(snapshotPromises)
              .then((res) => {
                return resolve(res);
              })
              .catch((e) => {
                console.error(e);
                return reject(e);
              });
          } else {
            console.error('No exchanges to snapshot.');
            return resolve();
          }
        });
    });
  }
};

module.exports = exchanges;
