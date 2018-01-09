const Promise = require('bluebird');

const Exchange = require('../../models/Exchange.js');

const debug = require('debug')('Exchange:Bittrex');
const bittrexAPI = require('node-bittrex-api');

/**
 * BITTREX EXCHANGE
 *
 * @memberof Bittrex
 */
class Bittrex extends Exchange {
  /**
   * Setup connection.
   *
   * @memberof Bittrex
   */
  preInit() {
    debug('Setting up connection');

    if (!this.options.key || !this.options.secret) {
      this.handleError('Invalid API key or secret');
      return;
    }

    this.connection.options({
      apikey: this.options.key,
      apisecret: this.options.secret,
      verbose: true,
      cleartext: false
    });
  }

  /**
   * Fetch Bittrex balances
   *
   * @returns {Pormise}
   * @memberof Bittrex
   */
  fetchBalances() {
    debug('Fetching balances');

    return new Promise((resolve, reject) => {
      this.connection.getbalances((data, err) => {
        if (err) {
          this.handleError(err);
          return reject(err);
        }

        const filterZeros = data.result.filter((val) => {
          return val.Available > 0;
        });

        this.balances = filterZeros;
        this.availableCurrencies = filterZeros.map((val) => {
          return val.Currency;
        });

        resolve(this);
      });
    });
  }

  /**
   * Fetch market trade history
   *
   * @returns {Pormise}
   * @memberof Bittrex
   */
  fetchMarketHistory() {
    debug('Fetching market history');

    return new Promise((resolve, reject) => {
      this.connection.getorderhistory({}, (data, err) => {
        this.marketHistory = trades;
      });
    });
  }
};

const bittrex = (options) => {
  return new Bittrex('Bittrex', options, bittrexAPI);
};

module.exports = bittrex;
