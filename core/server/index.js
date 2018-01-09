/**
 * AWAY WE GO!
 */

const debug = require('debug')('server:index');
const server = require('./src/server.js');
const db = require('./src/db.js');
// import errors from './errors';

/**
* Initialise server
*/
function init() {
  debug('Server initialising..');


  const port = process.env.PORT || 8080;
  const host = process.env.HOSTNAME || '0.0.0.0';

  const serverInsance = server.listen(port, host, () => {
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
      const actions = [serverInsance.close, db.destroy];
      actions.forEach((close, i) => {
        try {
          close(() => {
            if (i === actions.length - 1) process.exit();
          });
        } catch (err) {
          if (i === actions.length - 1) process.exit();
        }
      });
    }
    if (err) errors.report(err);
    if (options.exit) process.exit();
  }

  process.on('exit', handleExit.bind(null, {cleanup: true}));
  process.on('SIGINT', handleExit.bind(null, {exit: true}));
  process.on('SIGTERM', handleExit.bind(null, {exit: true}));
  process.on('uncaughtException', handleExit.bind(null, {exit: true}));
  debug('Server initialisation complete');
}

module.exports = init;
