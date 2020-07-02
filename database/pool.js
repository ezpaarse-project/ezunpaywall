const { Pool } = require('pg');
const config = require('config');

const db = config.get('POSTGRES_DB');
const user = config.get('POSTGRES_USER');
const password = config.get('POSTGRES_PASSWORD');
const databasePort = config.get('POSTGRES_PORT');

const pool = new Pool({
  user,
  password,
  host: 'database',
  port: databasePort,
  database: db,
});

module.exports = pool;
