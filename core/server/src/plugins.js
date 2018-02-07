const debug = require('debug')('plugins');
const Promise = require('bluebird');
const queue = require('./redis').queue;

const {Plugins} = require('./models/plugin.model');

const Telegram = require('./plugins/telegram');
const availablePlugins = {
  telegram: Telegram
};
let pluginInstances = {};

const plugins = {
  init() {
    debug('Initialising plugins');
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
    queue.process('reloadPlugins', (job, done) => {
      debug('"reloadPlugins" event fired');
      this.loadPlugins()
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
  },

  getPlugins() {
    return pluginInstances;
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

module.exports = plugins;
