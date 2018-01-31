const debug = require('debug')('trades');
const Promise = require('bluebird');
const queue = require('./redis').queue;

const exchanges = require('./exchanges');
const {Trade, Trades} = require('./models/trade.model');

const trades = {
  init() {
    debug('Initialising trades');
    return new Promise((resolve, reject) => {
      this.listen();
      resolve();
    });
  },

  listen() {
    debug('Listening for events');
    queue.process('fetchTrades', (job, done) => {
      debug('"fetchTrades" event fired');
      this.fetchTrades()
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  },

  fetchTrades() {
    debug('Obtaining new trades');
    return new Promise((resolve, reject) => {
      const activeExchanges = exchanges.getExchanges();

      if (Object.keys(activeExchanges).length === 0) {
        console.error('No active exchanges available to fetch trades from.');
        return resolve();
      }

      Trades.lastUpdate()
        .then((trade) => {
          let lastUpdated = null;
          if (trade) {
            lastUpdated = trade.toJSON().datetime;
          }

          const tradePromises = Object.keys(activeExchanges)
            .map((exchange) => {
              return activeExchanges[exchange]
                .fetchOrders(null, lastUpdated)
                .then((trades) => {
                  if (trades.length === 0) {
                    debug(`No new ${exchange} trades`);
                    return Promise.resolve();
                  }
                  const tradeInserts = trades.map((t) => {
                    const symbols = /^(.*)\/(.*)$/ig.exec(t.symbol);

                    const tradeData = {
                      exchange: exchange,
                      tran_id: t.id || 'unavailable',
                      datetime: t.datetime,
                      status: t.status,
                      symbolBuy: symbols[1],
                      symbolSell: symbols[2],
                      type: t.type,
                      side: t.side || 'unavailable',
                      price: t.price || 0,
                      amount: t.amount || 0,
                      fee: t.fee
                    };

                    queue.create('event',
                      {
                        type: 'trade',
                        data: tradeData
                      })
                      .priority('normal')
                      .save();

                    return tradeData;
                  });

                  return Trade.bulkCreate(tradeInserts);
                });
            });

          debug('Processing any trades');
          return Promise.all(tradePromises);
        })
        .then((res) => {
          debug('Processed trades');
          return resolve(res);
        })
        .catch((e) => {
          console.error(e);
          return reject(e);
        });
    });
  }
};

module.exports = trades;
