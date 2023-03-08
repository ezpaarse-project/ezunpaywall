const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function logConfig() {
  if (copyConfig.apikey === defaultConfig.apikey) {
    logger.warn('[config]: Apikey is the default value');
  } else {
    copyConfig.apikey = '********';
  }

  logger.info(JSON.stringify(copyConfig, null, 2));
}

module.exports = logConfig;
