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
   */
  init() {
    debug(`Initialising exchange.. ${this.name || ''}`);

    this.preInit();
  }

  /**
   * Ran before initialising exchnage.
   *
   * @memberof Exchange
   */
  preInit() {
    // Setup exchange connections
    debug('Skipping pre-init');
  }

  /**
   * Get exchange cryptocurrency balances.
   *
   * @memberof Exchange
   */
  getBalances() {
    debug(`'getBalances' method not setup for ${this.name} exchange`);
  }

  /**
   * Get market trade history
   *
   * @memberof Exchange
   */
  getMarketHistory() {
    debug(`'getMarketHistory' method not setup for ${this.name} exchange`);
  }

  /**
   * Destroy this connection
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
