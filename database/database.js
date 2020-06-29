const config = require('config');

const Sequelize = require('sequelize');

const db = config.get('POSTGRES_DB');
const user = config.get('POSTGRES_USER');
const password = config.get('POSTGRES_PASSWORD');

module.exports = new Sequelize(db, user, password, {
  host: 'database',
  dialect: 'postgres',
  operatorsAliases: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
