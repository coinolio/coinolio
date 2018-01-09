/**
 * DATABASE
 */

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  database: 'coinolio',
  debug: process.env.DATABASE_DEBUG === 'true'
});

module.exports = db;
