const debug = require('debug')('events');
const Promise = require('bluebird');
const queue = require('./redis').queue;

const plugins = require('./plugins');
const {Events} = require('./models/event.model');
const {Snapshots} = require('./models/snapshot.model');

let userEvents = [];
let userSchedules = [];

const events = {
  init() {
    debug('Initialising events');
    return new Promise((resolve, reject) => {
      return this.loadEvents()
        .then(() => {
          this.listen();
          resolve();
        });
    });
  },

  listen() {
    debug('Listening..');
    queue.process('reloadEvents', (job, done) => {
      debug('"reloadEvents" event fired');
      this.loadEvents()
        .then(() => {
          done();
        })
        .catch((err) => {
          done(err);
        });
    });
    queue.process('event', (job, done) => {
      debug(`New event fired: ${job.data.type}`);
      const pluginInstances = plugins.getPlugins();

      if (Object.keys(pluginInstances).length === 0) {
        return resolve('No plugins initialised');
      }
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
              Snapshots.listInterval({interval: job.data.config.interval, duration: job.data.config.duration})
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
              .attempts(2)
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
      return resolve();
    });
  }
};

module.exports = events;
