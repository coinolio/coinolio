const debug = require('debug')('Exchange:Base');
/**
 * EXCHANGE CLASS
 */
class Exchange {
  /**
   * Creates an instance of Exchange.
   * @param {string} name - The name of the exchange.
   * @param {Object} options - The config options for the exchange.
   * @param {*} connection - The exchange connection 'base'.
   * @param {Date} lastUpdate - The last time the exchange was updated.
   * @memberof Exchange
   */
  constructor(name, options, connection, lastUpdate) {
    this.name = name;
    this.options = options;
    this.balances = [];
    this.availableCurrencies = [];
    this.marketHistory = [];
    this.connection = connection;
  };

  /**
   * Initialise exchange
   *
   * @memberof Exchange
   * @returns {Promise}
   */
  init() {
    return new Promise((resolve, reject) => {
      debug(`Initialising exchange.. ${this.name || ''}`);
      this.preInit();
      resolve();
    });
  }

  /**
   * Ran before initialising exchange.
   *
   * @memberof Exchange
   */
  preInit() {
    // Setup exchange connections
    debug('Skipping pre-init');
  }

  /**
   * Fetch exchange cryptocurrency balances.
   *
   * @memberof Exchange
   */
  fetchBalances() {
    debug(`'fetchBalances' method not setup for ${this.name} exchange`);
  }

  /**
   * Get current balances in class.
   *
   * @returns {Array} - The balances array.
   * @memberof Exchange
   */
  getBalances() {
    return this.balances;
  }

  /**
   * Fetch market trade history.
   *
   * @memberof Exchange
   */
  fetchMarketHistory() {
    debug(`'fetchMarketHistory' method not setup for ${this.name} exchange`);
  }

  /**
   * Get current market trade history in class.
   *
   * @returns {Array} - The market history array.
   * @memberof Exchange
   */
  getMarketHistory() {
    return this.marketHistory;
  }

  /**
   * Destroy this connection.
   *
   * @memberof Exchange
   */
  destroy() {
    debug(`'destory' method not setup for ${this.name} exchange`);
  }

  /**
   * Handle errors in exchange events
   * @param {String} error - Error string
   *
   * @memberof Exchange
   */
  handleError(error) {
    debug(`${this.name} exchange error: ${error}`);
    // Log to log file
  }
};

module.exports = Exchange;
