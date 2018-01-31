const debug = require('debug')('events');
const Promise = require('bluebird');
const queue = require('./redis').queue;

const {Plugins} = require('./models/plugin.model');
const {Events} = require('./models/event.model');

const Telegram = require('./plugins/telegram');
const availablePlugins = {
  telegram: Telegram
};
let pluginInstances = {};
let userEvents = [];

const events = {
  init() {
    debug('Initialising events');
    return new Promise((resolve, reject) => {
      return this.loadPlugins()
        .then(this.loadEvents())
        .then(() => {
          this.listen();
          resolve();
        });
    });
  },

  listen() {
    debug('Listening..');
    queue.process('event', (job, done) => {
      debug(`New event fired: ${job.data.type}`);
      const validEvents = userEvents.filter((e) => {
        return e.type === job.data.type && e.enabled;
      });

      const eventPromises = validEvents.map((event) => {
        return new Promise((resolve, reject) => {
          const pluginPromises = event.plugins.map((p) => {
            debug(`Sending '${event.title}' via ${p.name}`);
            let payload = '';
            if (event.type === 'trade') {
              payload = `
<b>${event.title}</b>\n
<b>Order ID:</b> ${job.data.values.tran_id}
<b>Date:</b> ${job.data.values.datetime}
<b>Type:</b> ${job.data.values.type}
<b>Side:</b> ${job.data.values.side}
<b>Currency:</b> ${job.data.values.symbolBuy}
<b>Trading pair:</b> ${job.data.values.symbolSell}-${job.data.values.symbolBuy}
<b>Exchange:</b> ${job.data.values.exchange}
<b>Amount:</b> ${job.data.values.amount}
<b>Rate:</b> ${job.data.values.price}
<b>Total:</b> ${job.data.values.amount * job.data.values.price} ${job.data.values.symbolSell}
              `;
            }
            console.log(pluginInstances);
            return pluginInstances[p.name.toLowerCase()]
              .sendPayload(payload);
          });

          Promise.all(pluginPromises)
            .then(() => {
              resolve();
            })
            .catch((e) => {
              reject(e);
            });
        });
      });

      Promise.all(eventPromises)
        .then((values) => {
          debug(`Sent all event actions`);
          done();
        })
        .catch((e) => {
          done(e);
        });
    });
  },

  loadPlugins() {
    debug('Loading active plugins');
    pluginInstances = {};
    return new Promise((resolve, reject) => {
      Plugins.list()
        .then((plugins) => {
          const parsed = plugins.toJSON().filter((e) => {
            return e.enabled;
          });
          if (parsed.length === 0) {
            console.error('No plugins available. Please add a plugin or enable an existing.');
            return resolve();
          }
          parsed.forEach((e) => {
            const name = e.name.toLowerCase();
            const plugin = availablePlugins[name];
            pluginInstances[name] = new plugin(e.config);
            pluginInstances[name].init();
          });
          return resolve(pluginInstances);
        })
        .catch((e) => {
          console.error(e);
          return reject(e);
        });
    });
  },

  loadEvents() {
    debug('Loading active events');
    userEvents = [];
    return new Promise((resolve, reject) => {
      Events.list()
        .then((res) => {
          const events = res.toJSON();
          if (events.length === 0) {
            debug('No events stored.');
            return resolve();
          }
          userEvents = events;
          resolve(userEvents);
        });
    });
  },

  stop() {
    return new Promise((resolve, reject) => {
      const stopPromises = Object.keys(pluginInstances).map((plugin) => {
        return pluginInstances[plugin].destroy()
          .then(() =>{
            Promise.resolve();
          });
      });

      Promise.all(stopPromises)
        .then(() => {
          return resolve();
        });
    });
  }
};

module.exports = events;
