const Promise = require('bluebird');
const db = require('../db');
const httpStatus = require('http-status');
const APIError = ('../utils/errors').APIError;

const Event = db.Model.extend({
  tableName: 'events',
  hasTimestamps: true,
  plugins: function() {
    return this.belongsToMany('Plugin', 'events_plugins', 'event_id', 'plugin_id');
  }
}, {

  /**
   * Get event
   * @param {string} id - The ID of event.
   * @return {Promise}
   */
  get(id) {
    return Event.findById(id,
      {
        require: true,
        withRelated: ['plugins']
      })
      .then((event) => {
        if (event) {
          event = event.toJSON({omitPivot: true});
          return event;
        }
        const err = new APIError(
          'No such event exists!',
          httpStatus.NOT_FOUND
        );
        return Promise.reject(err);
      });
  }
});

const Events = db.Collection.extend({
  model: Event
}, {
  /**
   * List events in descending order of 'created_at' timestamp.

   * @return {Promise}
   */
  list() {
    return Events
      .query((qb) => {
        qb
          .select();
      })
      .orderBy('created_at', 'DESC')
      .fetch({
        withRelated: ['plugins']
      });
  }
});

module.exports = {
  Event: db.model('Event', Event),
  Events: db.collection('Events', Events)
};
