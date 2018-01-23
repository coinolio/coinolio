/**
 * API keys and Passport configuration.
 */
const passportConfig = require('../config/passport');

module.exports = {
  requireLogin: passportConfig.isAuthenticated
};
