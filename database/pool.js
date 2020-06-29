const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  password: 'postgres',
  host: 'database',
  port: 5432,
  database: 'example',
});

module.exports = pool;
