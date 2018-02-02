const {Event, Events} = require('../models/event.model');
const queue = require('../redis').queue;

/**
 * Load event and append to req.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @param {*} id - The id of the event to load.
 */
function load(req, res, next, id) {
  Event.get(id)
    .then((event) => {
      req.event = event;
      return next();
    })
    .catch((e) => next(e));
}

/**
 * Get event
 * @param {*} req
 * @param {*} res
 * @returns {Event}
 */
function get(req, res) {
  return res.json(req.event);
}

/**
 * Create new event
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function create(req, res, next) {
  Event.create(
    {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      config: req.body.config,
      enabled: req.body.enabled !== undefined ? req.body.enabled : true
    })
    .then((event) => {
      return event.plugins().attach(req.body.plugins)
        .then(() => {
          const refreshEvents = queue
            .createJob('refreshEvents', {})
            .priority('high');
          queue.now(refreshEvents);
          return res.json(event.toJSON());
        });
    })
    .catch((e) => {
      next(e);
    });
}

/**
 * Update existing event.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function update(req, res, next) {
  Event
    .update({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      config: req.body.config,
      enabled: req.body.enabled
    }, {id: req.event.id})
    .then((event) => {
      if (req.body.plugins) {
        event.plugins().detach()
          .then(() => {
            return event.plugins().attach(req.body.plugins);
          })
          .then(() => {
            const refreshEvents = queue
              .createJob('refreshEvents', {})
              .priority('high');
            queue.now(refreshEvents);
            return res.json(event.toJSON());
          });
      } else {
        const refreshEvents = queue
          .createJob('refreshEvents', {})
          .priority('high');
        queue.now(refreshEvents);
        return res.json(event.toJSON());
      }
    })
    .catch((e) => next(e));
}

/**
 * Get event list.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function list(req, res, next) {
  Events.list()
    .then((events) => res.json(events))
    .catch((e) => next(e));
}

/**
 * Delete event.
 * @param {*} req
 * @param {*} res
 * @param {Function} next - Called when complete.
 */
function remove(req, res, next) {
  const event = req.event;
  Event.destroy(event)
    .then((deletedEvent) => res.json(deletedEvent))
    .catch((e) => next(e));
}

module.exports = {load, get, create, update, list, remove};
