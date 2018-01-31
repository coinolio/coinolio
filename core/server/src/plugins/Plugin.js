const debug = require('debug')('Plugin:Base');
const errors = require('../utils/errors');

/**
 * EXCHANGE CLASS
 */
class Plugin {
  /**
   * Creates an instance of Plugin.
   *
   * @param {Object} options - The config options for the plugin.
   * @memberof Plugin
   */
  constructor(options) {
    this.name;
    this.options = options;
  };

  /**
   * Initialise exchange
   *
   * @memberof Plugin
   */
  init() {
    debug(`Initialising plugin: ${this.name || ''}`);
  }

  /**
   * Send payload to plugin target.
   *
   * @param {string} payload - What data to send.
   * @memberof Plugin
   */
  sendPayload(payload) {
    debug(`'sendPayload' method not setup for ${this.name} plugin`);
  }

  /**
   * Destroy this connection.
   *
   * @memberof Plugin
   */
  destroy() {
    debug(`'destroy' method not setup for ${this.name} plugin`);
  }

  /**
   * Handle errors in exchange events.
   *
   * @param {string} error - Error string.
   * @memberof Plugin
   */
  handleError(error) {
    debug(`${this.name} exchange error: ${error}`);
    errors.log(error);
  }
};

module.exports = Plugin;
