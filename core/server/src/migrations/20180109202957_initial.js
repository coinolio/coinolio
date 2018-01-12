
exports.up = function(knex, Promise) {
  // User accounts
  db.schema.createTable('users', (table) => {
    // UUID v1mc reduces the negative side effect of using random primary keys
    // with respect to keyspace fragmentation on disk for the tables because it's time based
    // https://www.postgresql.org/docs/current/static/uuid-ossp.html
    table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
    table.string('display_name', 100);
    table.string('image_url', 200);
    table.string('password_hash', 128);
    table.timestamps(false, true);
  }).then(() => {
    // Users' email addresses
    db.schema.createTable('emails', (table) => {
      table.uuid('id').notNullable().defaultTo(db.raw('uuid_generate_v1mc()')).primary();
      table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
      table.string('email', 100).notNullable();
      table.boolean('verified').notNullable().defaultTo(false);
      table.boolean('primary').notNullable().defaultTo(false);
      table.timestamps(false, true);
      table.unique(['user_id', 'email', 'verified']);
    });
  });
};

exports.down = function(knex, Promise) {
  db.schema.dropTableIfExists('emails')
    .then(() => {
      db.schema.dropTableIfExists('users');
    });
};
