const debug = require('debug')('Errors');

const errors = {
  log(error) {
    debug(error);
  }
};
module.exports = errors;
