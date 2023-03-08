const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function showConfig() {
  if (copyConfig.apikey === defaultConfig.apikey) {
    logger.warn('[config]: Apikey is the default value');
  } else {
    copyConfig.apikey = '********';
  }

  if (copyConfig.redis.password === defaultConfig.redis.password) {
    logger.warn('[config]: Redis password is the default value');
  } else {
    copyConfig.redis.password = '********';
  }

  logger.info(JSON.stringify(copyConfig, null, 2));
}

module.exports = showConfig;
