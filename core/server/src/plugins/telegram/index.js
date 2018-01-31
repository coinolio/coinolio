const Plugin = require('../Plugin');
/**
 * TELEGRAM PLUGIN
 */
class Telegram extends Plugin {
  /**
   * Creates an instance of Telegram.
   *
   * @param {Object} options - The config options for the Telegram bot.
   * @memberof Plugin
   */
  constructor(options) {
    super(options);

    this.name = 'Telegram';
  }
};

module.exports = Telegram;
