
exports.up = function(knex, Promise) {
  // User accounts
  return Promise.all([
    knex.schema.createTable('snapshots', (table) => {
      table.increments('id').unsigned().primary();
      table.string('exchange').notNullable();
      table.json('snapshot').notNullable();
      table.timestamps(true, true);
    })
  ]);
};

exports.down = function(knex, Promise) {
  return Promise.all([
    knex.schema.dropTable('snapshots')
  ]);
};
