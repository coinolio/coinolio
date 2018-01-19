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
  const createSnapshot = queue
    .createJob('createSnapshot')
    .priority('normal')
    .unique('createSnapshot');

  // Initial launch jobs
  queue.now(createSnapshot);


  // Scheduled jobs
  queue.every('*/1 * * * *', createSnapshot);
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
