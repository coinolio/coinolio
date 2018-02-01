process.env['NTBA_FIX_319'] = 1;
const Plugin = require('../Plugin');
const TelegramBot = require('node-telegram-bot-api');

/**
 * TELEGRAM PLUGIN
 */
class Telegram extends Plugin {
  /**
   * Creates an instance of Telegram.
   *
   * @param {Object} options - The config options for the Telegram bot.
   * @memberof Telegram
   */
  constructor(options) {
    super(options);

    this.name = 'Telegram';
    this.connection = null;
    this.chatId;
  }

  /**
   * Initialise Telegram
   *
   * @memberof Telegram
   */
  init() {
    super.init();
    this.connection = new TelegramBot(this.options.token, {polling: true});

    // Load past chat if available
    this.store.hgetall(
      `${this.name}_plugin`,
      (err, reply) => {
        if (err) {
          this.handleError(err);
          return;
        }
        if (reply) {
          this.chatId = reply.chatId;
          this.connection.sendMessage(this.chatId, 'Coinolio server back online.. 🎉');
        }
      }
    );

    this.connection.onText(/\/start/, (msg) => {
      this.chatId = msg.chat.id;
      this.store.hmset(
        `${this.name}_plugin`,
        'chatId', msg.chat.id,
        (err) => {
          this.handleError(err);
        }
      );

      this.connection.sendMessage(msg.chat.id, 'Welcome to Coinolio!');
    });
  }

  /**
   * Send payload to plugin target.
   *
   * @param {object} payload - What data to send.
   * @memberof Telegram
   */
  sendPayload(payload) {
    super.sendPayload();
    if (!this.chatId) {
      debug(`Chat has not been initiated`);
    }
    this.connection.sendMessage(this.chatId, payload, {parse_mode: 'HTML'});
  }

  /**
   * Destroy this connection.
   *
   * @returns {Promise}
   * @memberof Telegram
   */
  destroy() {
    super.destroy();
    if (this.chatId) {
      return this.connection.sendMessage(this.chatId, 'Coinolio is shutting down.\nYou may need to run /start once restarted.')
        .then(() => {
          this.connection.stopPolling({
            reason: 'Application shutting down'
          });
        });
    }
    return this.connection.stopPolling({
      reason: 'Application shutting down'
    });
  }
};

module.exports = Telegram;
