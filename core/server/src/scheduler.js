/**
 * AWAY WE GO!
 */

const debug = require('debug')('scheduler');
const kue = require('kue-scheduler');
const queue = kue.createQueue({

});
// import errors from './errors';

/**
* Initialise scheduler
*/
function init() {
  debug('Initialising...');
  const getBalance = queue
    .createJob('getBalance')
    .attempts(3)
    .backoff(true)
    .priority('normal')
    .unique('getBalance');

  // Initial launch jobs
  queue.now(getBalance);


  // Scheduled jobs
  queue.every('*/1 * * * *', getBalance);
}

/**
 * Stop scheduler and clear backlog
 * @param {Function} cb - The callback when stopping complete.
 */
function stop(cb) {
  debug('Stopping...');
  queue.clear((error, response) => {
    debug('Scheduler cleared');
    cb();
  });
}

module.exports = {
  init,
  stop
};
