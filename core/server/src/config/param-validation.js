const Joi = require('joi');

module.exports = {
  // POST /api/users
  createUser: {
    body: {
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email(),
      password: Joi.string().regex(/^[a-zA-Z0-9!@#$&\*]{3,30}$/).required()
    }
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: {
      username: Joi.string().alphanum().min(3).max(30).required(),
      email: Joi.string().email(),
      password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required()
    },
    params: {
      userId: Joi.string().hex().required()
    }
  },

  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required(),
      password: Joi.string().required()
    }
  },

  // POST /api/exchanges
  createExchange: {
    body: {
      name: Joi.string().required(),
      config: Joi.object().required(),
      enabled: Joi.boolean()
    }
  },

  // UPDATE /api/exchanges/:exchangeId
  updateExchange: {
    body: {
      name: Joi.string(),
      config: Joi.object(),
      enabled: Joi.boolean()
    },
    params: {
      exchangeId: Joi.string().required()
    }
  }
};
