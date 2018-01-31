
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
      }),
    knex.schema.createTableIfNotExists('trades',
      (table) => {
        table.string('tran_id').notNullable();
        table.timestamp('datetime').notNullable().primary();
        table.string('status');
        table.string('symbolBuy').notNullable();
        table.string('symbolSell').notNullable();
        table.string('type');
        table.string('side').notNullable();
        table.decimal('price').notNullable();
        table.decimal('amount').notNullable();
        table.json('fee');
        table.string('exchange').notNullable();
        table.index('tran_id');
      })
      .then(() => {
        return knex.raw(`CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE`);
      })
      .then(() =>{
        return knex.raw(`SELECT create_hypertable('trades', 'datetime')`);
      }),
    knex.schema.createTableIfNotExists('plugins',
      (table) => {
        table.increments('id').unsigned().primary();
        table.string('name').notNullable().unique();
        table.json('config').notNullable();
        table.boolean('enabled');
        table.timestamps(true, true);
      }),
    knex.schema.createTableIfNotExists('events',
      (table) => {
        table.increments('id').unsigned().primary();
        table.string('title').notNullable().unique();
        table.string('description');
        table.string('type').notNullable();
        table.json('config').notNullable();
        table.boolean('enabled');
        table.timestamps(true, true);
      }),
    knex.schema.createTableIfNotExists('events_plugins',
      (table) => {
        table.integer('event_id').unsigned().references('id').inTable('events');
        table.integer('plugin_id').unsigned().references('id').inTable('plugins');
        table.primary(['event_id', 'plugin_id']);
      })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('snapshots')
  ]);
};
