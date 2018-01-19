/**
 * DATABASE
 */

const knex = require('knex');
const config = require('./config');

const bookshelf = require('bookshelf')(knex({
  client: 'pg',
  connection: {
    host: config.database.host,
    user: config.database.user,
    password: config.database.password,
    database: config.database.location
  },
  migrations: {
    tableName: 'migrations'
  },
  debug: process.env.DATABASE_DEBUG === 'true'
}));
bookshelf.plugin('registry');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

module.exports = bookshelf;
