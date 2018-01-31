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
  },

  // POST /api/trades
  createTrade: {
    body: {
      tran_id: Joi.string().required(),
      datetime: Joi.date().required(),
      status: Joi.string(),
      symbolBuy: Joi.string().required(),
      symbolSell: Joi.string().required(),
      type: Joi.string(),
      side: Joi.string().required(),
      price: Joi.number().required(),
      amount: Joi.number().required(),
      fee: Joi.object({
        currency: Joi.string().required(),
        cost: Joi.number().required()
      }),
      exchange: Joi.string().required()
    }
  },

  // UPDATE /api/trades/:tradeId
  updateTrade: {
    body: {
      datetime: Joi.date(),
      status: Joi.string(),
      symbolBuy: Joi.string(),
      symbolSell: Joi.string(),
      type: Joi.string(),
      side: Joi.string(),
      price: Joi.number(),
      amount: Joi.number(),
      fee: Joi.object({
        currency: Joi.string().required(),
        cost: Joi.number().required()
      }),
      exchange: Joi.string()
    },
    params: {
      exchangeId: Joi.string()
    }
  },

  // POST /api/plugins
  createPlugin: {
    body: {
      name: Joi.string().required(),
      config: Joi.object().required(),
      enabled: Joi.boolean()
    }
  },

  // UPDATE /api/plugins/:plugineId
  updatePlugin: {
    body: {
      name: Joi.string(),
      config: Joi.object(),
      enabled: Joi.boolean()
    },
    params: {
      pluginId: Joi.string().required()
    }
  },

  // POST /api/events
  createEvent: {
    body: {
      title: Joi.string().required(),
      description: Joi.string(),
      type: Joi.string().required(),
      config: Joi.object(),
      enabled: Joi.boolean(),
      plugins: Joi.any()
    }
  },

  // UPDATE /api/eventss/:eventId
  updateEvent: {
    body: {
      title: Joi.string().required(),
      description: Joi.string(),
      type: Joi.string().required(),
      config: Joi.object(),
      enabled: Joi.boolean(),
      plugins: Joi.any()
    },
    params: {
      eventId: Joi.string().required()
    }
  }
};
