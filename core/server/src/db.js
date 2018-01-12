/**
 * DATABASE
 */

const knex = require('knex');
const config = require('./config');

const bookshelf = require('bookshelf')(knex({
  client: 'pg',
  connection: config.host,
  database: config.location,
  migrations: {
    tableName: 'migrations'
  },
  debug: process.env.DATABASE_DEBUG === 'true'
}));
bookshelf.plugin('registry');
bookshelf.plugin(require('bookshelf-modelbase').pluggable);

module.exports = bookshelf;
