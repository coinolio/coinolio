/**
 * AWAY WE GO!
 */
const debug = require('debug')('scheduler');
const queue = require('./redis').queue;

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

  const fetchTrades = queue
    .createJob('fetchTrades')
    .priority('normal')
    .unique('fetchTrades');

  // Initial launch jobs
  queue.now(createSnapshot);
  queue.now(fetchTrades);


  // Scheduled jobs
  queue.every('*/2 * * * *', createSnapshot);
  queue.every('*/2 * * * *', fetchTrades);
}

/**
 * Stop scheduler and clear backlog
 * @return {Promise}
 */
function stop() {
  return new Promise((resolve, reject) => {
    queue.clear((error, response) => {
      debug('Scheduler cleared...');
      return resolve();
    });
  });
}

module.exports = {
  init,
  stop
};
