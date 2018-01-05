const server = require('./server');

// Set the default environment to be `development`
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the whole application
 * @param {Object} options - Initialisation properties
 *
 * @returns {*}
 */
function init(options) {
  options = options || {};

  return server(options);
}

module.exports = init;
