const config = require('config');

const Sequelize = require('sequelize');

const db = config.get('POSTGRES_DB');
const user = config.get('POSTGRES_USER');
const password = config.get('POSTGRES_PASSWORD');
const host = config.get('POSTGRES_HOST');

module.exports = new Sequelize(db, user, password, {
  logging: false, // cancel the log in console
  host,
  dialect: 'postgres',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
