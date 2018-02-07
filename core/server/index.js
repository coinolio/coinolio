/**
 * AWAY WE GO!
 */

const debug = require('debug')('server:index');
const server = require('./src/server');
const exchanges = require('./src/exchanges');
const trades = require('./src/trades');
const plugins = require('./src/plugins');
const events = require('./src/events');
const scheduler = require('./src/scheduler');
const db = require('./src/db');

/**
* Initialise server
*/
function init() {
  debug('Server initialising..');


  const port = process.env.PORT || 8080;
  const host = process.env.HOSTNAME || '0.0.0.0';

  const modules = [exchanges.init(), trades.init(), plugins.init(), events.init()];
  Promise.all(modules)
    .then(() => {
      scheduler.init();
    });
  server.listen(port, host, () => {
    console.log(`Coinolio API server is listening on http://${host}:${port}/`);
  });

  /**
   * Gracefully shutdown server
   *
   * @param {any} options
   * @param {any} err
   */
  function handleExit(options, err) {
    if (options.cleanup) {
      const actions = [scheduler.stop(), events.stop(), plugins.stop(), db.knex.destroy()];
      Promise.all(actions)
        .then(() => {
          process.exit();
        })
        .catch((err) => {
          console.error(err);
          process.exit();
        });
    }
    if (err) {
      debug(err);
    }
    if (options.exit) {
      debug('Force quit');
      process.exit();
    }
  }

  process.on('exit', handleExit.bind(null, {cleanup: true}));
  process.on('SIGINT', handleExit.bind(null, {cleanup: true}));
  process.on('SIGTERM', handleExit.bind(null, {cleanup: true}));
  process.on('uncaughtException', handleExit.bind(null, {exit: true}));
  debug('Server initialisation complete');
}

module.exports = init;
