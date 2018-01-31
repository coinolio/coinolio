const {Plugin, Plugins} = require('../models/plugin.model');
const queue = require('../redis').queue;

/**
 * Load plugin and append to req.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} id - The id of the plugin to load.
 */
function load(req, res, next, id) {
  Plugin.get(id)
    .then((plugin) => {
      req.plugin = plugin;
      return next();
    })
    .catch((e) => next(e));
}

/**
 * Get plugin
 * @param {*} req
 * @param {*} res
 * @returns {Plugin}
 */
function get(req, res) {
  return res.json(req.plugin);
}

/**
 * Create new plugin
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function create(req, res, next) {
  Plugin.create(
    {
      name: req.body.name,
      config: req.body.config,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true
    })
    .then((plugin) => {
      const refreshPlugins = queue
        .createJob('refreshPlugins', {})
        .priority('high');
      queue.now(refreshPlugins);
      return res.json(plugin.toJSON());
    })
    .catch((e) => {
      next(e);
    });
}

/**
 * Update existing plugin.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function update(req, res, next) {
  Plugin
    .update(req.body, {id: req.plugin.id})
    .then((savedPlugin) => {
      const refreshPlugins = queue
        .createJob('refreshPlugins', {})
        .unique('refreshPlugins')
        .priority('high');
      queue.now(refreshPlugins);
      return res.json(savedPlugin);
    })
    .catch((e) => next(e));
}

/**
 * Get plugin list.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function list(req, res, next) {
  Plugins.list()
    .then((plugins) => res.json(plugins))
    .catch((e) => next(e));
}

/**
 * Delete plugin.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function remove(req, res, next) {
  const plugin = req.plugin;
  Plugin.destroy(plugin)
    .then((deletedPlugin) => res.json(deletedPlugin))
    .catch((e) => next(e));
}

module.exports = {load, get, create, update, list, remove};
