/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
// npm run migrate create my-first-migration
// npm run migrate up
exports.up = (pgm) => {
   pgm.createTable('transactions', {
      id: 'id',
      amount: { type: 'double precision', notNull: true },
      amount_settle: { type: 'double precision', notNull: true },
      description: { type: 'varchar(50)', notNull: true },
      reference: { type: 'varchar(12)', notNull: true },
      account_name: { type: 'varchar(50)', notNull: true },
      status: { type: 'varchar(10)', notNull: true },
      fee: { type: 'double precision', notNull: true },
      transaction_type: { type: 'varchar(4)', notNull: true },
      setlement_status: { type: 'smallint', default: 0 },
      expiration_date: { type: 'varchar(5)' },
      card_number: { type: 'varchar(4)' },
      cvv: { type: 'varchar(3)' },
      currency: { type: 'varchar(3)' },
      account_number: { type: 'varchar(10)' },
      bank_code: { type: 'varchar(10)' },
      createdAt: {
         type: 'timestamp',
         notNull: true,
         default: pgm.func('current_timestamp'),
      },
      updatedAt: {
         type: 'timestamp',
         notNull: true,
         default: pgm.func('current_timestamp'),
      },
   });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => { };
