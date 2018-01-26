
exports.up = function(knex, Promise) {
  // User accounts
  return Promise.all([
    knex.schema.createTableIfNotExists('snapshots',
      (table) => {
        table.timestamp('time').default(knex.fn.now()).primary();
        table.string('exchange').notNullable();
        table.json('snapshot').notNullable();
        table.timestamps(true, true);
      })
      .then(() => {
        return knex.raw(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE`);
      })
      .then(() =>{
        return knex.raw(`SELECT create_hypertable('snapshots', 'time')`);
      }),
    knex.schema.createTableIfNotExists('users',
      (table) => {
        table.increments('id').unsigned().primary();
        table.string('username').notNullable();
        table.string('password').notNullable();
        table.string('email');
        table.timestamps(true, true);
      }),
    knex.schema.createTableIfNotExists('exchanges',
      (table) => {
        table.increments('id').unsigned().primary();
        table.string('name').notNullable().unique();
        table.json('config').notNullable();
        table.boolean('enabled');
        table.timestamps(true, true);
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('snapshots')
  ]);
};
