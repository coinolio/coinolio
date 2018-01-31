const debug = require('debug')('Plugin:Base');
const errors = require('../utils/errors');
const redisStore = require('../redis').client;

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
    this.store = redisStore;
  };

  /**
   * Initialise plugin
   *
   * @memberof Plugin
   */
  init() {
    debug(`Initialising plugin: ${this.name || ''}`);
  }

  /**
   * Send payload to plugin target.
   *
   * @param {object} payload - What data to send.
   * @memberof Plugin
   */
  sendPayload(payload) {
    debug(`'sendPayload' called for ${this.name} plugin`);
  }

  /**
   * Destroy this connection.
   *
   * @memberof Plugin
   */
  destroy() {
    debug(`Destroying ${this.name} plugin`);
  }

  /**
   * Handle errors in plugin events.
   *
   * @param {string} error - Error string.
   * @memberof Plugin
   */
  handleError(error) {
    debug(`${this.name} plugin error: ${error}`);
    errors.log(error);
  }
};

module.exports = Plugin;
