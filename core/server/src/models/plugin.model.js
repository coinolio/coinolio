const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Plugin = db.Model.extend({
  tableName: 'plugins',
  hasTimestamps: true
}, {
  /**
   * Get plugin
   * @param {string} id - The ID of plugin.
   * @return {Promise}
   */
  get(id) {
    return Plugin.findById(id,
      {
        require: true
      })
      .then((plugin) => {
        if (plugin) {
          plugin = plugin.toJSON({omitPivot: true});
          return plugin;
        }
        const err = new APIError(
          'No such plugin exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  },

  /**
   * Get plugin by name
   * @param {string} name - The nane of plugin.
   * @return {Promise}
   */
  getByName(name) {
    return Plugin.findWhere(
      {
        name: name
      })
      .then((plugin) => {
        if (plugin) {
          plugin = plugin.toJSON({omitPivot: true});
          return plugin;
        }
        const err = new APIError(
          'No such plugin exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  }
});

const Plugins = db.Collection.extend({
  model: Plugin
}, {
  /**
   * List plugins in descending order of 'created_at' timestamp.

   * @return {Promise}
   */
  list() {
    return Plugins
      .query((qb) => {
        qb
          .select();
      })
      .orderBy('created_at', 'DESC')
      .fetch();
  }
});

module.exports = {
  Plugin: db.model('Plugin', Plugin),
  Plugins: db.collection('Plugins', Plugins)
};
