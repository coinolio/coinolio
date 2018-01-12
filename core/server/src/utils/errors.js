const debug = require('debug')('Errors');
const httpStatus = require('http-status');
/**
 * @extends Error
 */
class ExtendableError extends Error {
  /**
   * Creates an instance of ExtendableError.
   * @param {string} message
   * @param {string} status
   * @param {boolean} isPublic
   * @memberof ExtendableError
   */
  constructor(message, status, isPublic) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    Error.captureStackTrace(this, this.constructor.name);
  }
}

/**
 * APIError
 */
class APIError extends ExtendableError {
  /**
   * Creates an API error.
   * @param {string} message - Error message.
   * @param {number} status - HTTP status code of error.
   * @param {boolean} isPublic - Is message visible to user.
   */
  constructor(
    message,
    status = httpStatus.INTERNAL_SERVER_ERROR,
    isPublic = false
  ) {
    super(message, status, isPublic);
  }
}

const errors = {
  log(error) {
    // Log to file / external logger
    debug(error);
  },

  APIError: APIError
};
module.exports = errors;
