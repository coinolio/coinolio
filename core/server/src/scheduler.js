/**
 * AWAY WE GO!
 */
const debug = require('debug')('scheduler');
const queue = require('./redis').queue;


queue.on('error', (err) => {
  debug('Kue error', err);
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
  queue.every('*/2 * * * *', createSnapshot);
}

/**
 * Stop scheduler and clear backlog
 * @return {Promise}
 */
function stop() {
  return new Promise((resolve, reject) => {
    debug('Stopping...');
    queue.shutdown(1000, function(err) {
      if (err) {
        return reject(err);
      }
      debug('Scheduler cleared', response);
      resolve();
    });
  });
  // queue.clear((error, response) => {
  //   debug('Scheduler cleared', response);
  //   cb(error);
  // });
}

module.exports = {
  init,
  stop
};
