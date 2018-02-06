const debug = require('debug')('events');
const Promise = require('bluebird');
const queue = require('./redis').queue;

const {Plugins} = require('./models/plugin.model');
const {Events} = require('./models/event.model');
const {Snapshots} = require('./models/snapshot.model');

const Telegram = require('./plugins/telegram');
const availablePlugins = {
  telegram: Telegram
};
let pluginInstances = {};
let userEvents = [];
let userSchedules = [];

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
            const pluginRef = pluginInstances[p.name.toLowerCase()];

            if (event.type === 'trade') {
              const payload = pluginRef.formatTrade(event.title, job.data.values);
              if (payload) {
                debug(`Sending '${event.title}' via ${p.name}`);
                return pluginRef
                  .sendPayload(payload);
              }
            } else if (event.type === 'summary' && event.title === job.data.title) {
              Snapshots.listInterval(job.data.config.interval, job.data.config.duration)
                .then((snapshots) =>{
                  const msg = pluginRef.formatSummary(event.title, snapshots.rows);
                  debug(`Sending '${event.title}' via ${p.name}`);
                  return pluginRef
                    .sendPayload(msg);
                });
            }
          });

          Promise.all(pluginPromises)
            .then(() => {
              debug('Plugin jobs complete');
              resolve();
            })
            .catch((e) => {
              console.error(e);
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
    this.clearSchedulers();
    return new Promise((resolve, reject) => {
      Events.list()
        .then((res) => {
          const events = res.toJSON();
          if (events.length === 0) {
            debug('No events stored.');
            return resolve();
          }
          userEvents = events;

          const schedules = userEvents.filter((e) => {
            return e.type === 'summary' && e.enabled;
          });

          for (let i=0; i < schedules.length; i++) {
            const entry = schedules[i];
            const job = queue
              .createJob('event', entry)
              .priority('normal');
            queue.every(entry.config.schedule, job);
          }

          resolve(userEvents);
        });
    });
  },

  clearSchedulers() {
    for (let i=0; i < userSchedules.length; i++) {
      queue.remove(userSchedules[i], (err) => {
        if (err) {
          console.error(err);
        }
      });
    }
  },

  stop() {
    return new Promise((resolve, reject) => {
      this.clearSchedulers();
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
