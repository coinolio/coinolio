const debug = require('debug')('events');
const Promise = require('bluebird');
const queue = require('./redis').queue;

const {Plugins} = require('./models/plugin.model');
// const {Event, Events} = require('./models/event.model');

const Telegram = require('./plugins/telegram');
const availablePlugins = {
  telegram: Telegram
};
let pluginInstances = {};

const events = {
  init() {
    debug('Initialising events');
    return new Promise((resolve, reject) => {
      return this.loadPlugins()
        .then(() => {
          this.listen();
          resolve();
        });
    });
  },

  listen() {
    debug('Listening..');
    queue.process('event', (job, done) => {
      debug(`New event fired: ${job.type}`);
      done();
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
};

module.exports = events;
