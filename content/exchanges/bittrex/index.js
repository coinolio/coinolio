const Exchange = require('../../../core/server/src/models/Exchange.js');

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
    if (!process.env.BITTREX_KEY || !process.env.BITTREX_SECRET) {
      this.handleError('Invalid API key or secret');
    }

    this.connection.options({
      apikey: process.env.BITTREX_KEY,
      apisecret: process.env.BITTREX_SECRET,
      verbose: true,
      cleartext: false
    });
  }

  /**
   * Fetch Bittrex balances
   *
   * @memberof Bittrex
   */
  fetchBalances() {
    debug('Fetching balances');

    this.connection.getbalances((data, err) => {
      if (err) {
        return this.handleError(err);
      }

      const filterZeros = data.result.filter((val) => {
        return val.Available > 0;
      });

      this.balances = filterZeros;
      this.availableCurrencies = filterZeros.map((val) => {
        return val.Currency;
      });
    });
  }

  /**
   * Fetch market trade history
   *
   * @memberof Bittrex
   */
  fetchMarketHistory() {
    debug('Fetching market history');

    this.connection.getorderhistory({}, (data, err) => {
      this.marketHistory = trades;
    });
  }
};

const bittrex = new Bittrex('Bittrex', {}, bittrexAPI);

module.exports = bittrex;
