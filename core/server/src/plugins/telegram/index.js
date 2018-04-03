process.env['NTBA_FIX_319'] = 1;
const debug = require('debug')('plugin:Telegram');
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
      debug(`Telegram has not been initiated`);
    }
    this.connection.sendMessage(this.chatId, payload, {parse_mode: 'HTML'});
  }

  /**
   * Format trade data.
   *
   * @param {string} title - The title of the event.
   * @param {Object} data - The data to parse into valid plugin format.
   * @return {string} - The formatted data.
   */
  formatTrade(title, data) {
    return `
<b>${title}</b>\n
<b>Order ID:</b> ${data.tran_id}
<b>Date:</b> ${data.datetime}
<b>Type:</b> ${data.type}
<b>Side:</b> ${data.side}
<b>Currency:</b> ${data.symbolBuy}
<b>Trading pair:</b> ${data.symbolSell}-${data.symbolBuy}
<b>Exchange:</b> ${data.exchange}
<b>Amount:</b> ${data.amount}
<b>Rate:</b> ${data.price}
<b>Total:</b> ${data.amount * data.price} ${data.symbolSell}
    `;
  }

  /**
   * Format summary data.
   *
   * @param {string} title - The title of the event.
   * @param {Object} data - The data to parse into valid plugin format.
   * @return {string} - The formatted data
   */
  formatSummary(title, data) {
    const latest = data[0];
    const previous = data[1] || null;

    if (!latest) {
      return 'Not enough data to form summary 😔';
    }

    const firstBTC = parseFloat(latest.first_asset_value).toPrecision(12);
    const lastBTC = parseFloat(latest.last_asset_value).toPrecision(12);
    const firstFiat = parseFloat(latest.first_asset_fiat).toFixed(2);
    const lastFiat = parseFloat(latest.last_asset_fiat).toFixed(2);

    const diffFiat = previous ? (100 - (parseFloat(previous.last_asset_fiat).toFixed(2) / lastFiat) * 100).toFixed(2) : 0;
    const diffHoldings = previous ? (100 - (parseFloat(previous.last_asset_value).toFixed(12) / lastBTC) * 100).toFixed(2) : 0;

    let msg = `
<b>${title}</b>

<b>Current Asset Value</b>
    <b>Fiat:</b> ${lastFiat}
    <b>BTC:</b> ${lastBTC}
---
<b>Holdings Fiat</b>
    <b>Entry:</b> ${firstFiat}
    <b>High:</b> ${parseFloat(latest.max_asset_fiat).toFixed(2)}
    <b>Low:</b> ${parseFloat(latest.min_asset_fiat).toFixed(2)}
    <b>Spread:</b> ${(100 - (firstFiat / lastFiat) * 100).toFixed(2)}%
    <b>Change:</b> ${diffFiat}%
---
<b>Holdings BTC</b>
    <b>Entry:</b> ${firstBTC}
    <b>High:</b> ${parseFloat(latest.max_asset_value).toFixed(12)}
    <b>Low:</b> ${parseFloat(latest.min_asset_value).toFixed(12)}
    <b>Spread:</b> ${(100 - (firstBTC / lastBTC) * 100).toFixed(2)}%
    <b>Change:</b> ${diffHoldings}%
---
<b>BTC</b>
  <b>Price:</b> ${parseFloat(latest.last_btc_fiat).toFixed(2)} ${latest.last_btc_currency}
    `;

    return msg;
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
