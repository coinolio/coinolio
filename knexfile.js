const config = require('./core/server/src/config');

module.exports = {
  client: 'pg',
  connection: {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.location
  }
};
