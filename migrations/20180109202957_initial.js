
exports.up = function(knex, Promise) {
  // User accounts
  return Promise.all([
    knex.schema.createTable('snapshots', (table) => {
      table.timestamp('time').primary();
      table.string('exchange').notNullable();
      table.json('snapshot').notNullable();
      table.timestamps(true, true);
    })
      .then(() => {
        return knex.raw(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE`);
      })
      .then(() =>{
        return knex.raw(`SELECT create_hypertable('snapshots', 'time')`);
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('snapshots')
  ]);
};
