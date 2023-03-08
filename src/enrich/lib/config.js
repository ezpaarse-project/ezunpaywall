const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function getConfig(verbose) {
  if (verbose) {
    if (copyConfig.redis.password === defaultConfig.redis.password) {
      logger.warn('[config]: Redis password has the default value');
    }
  }

  copyConfig.redis.password = '********';

  if (verbose) {
    logger.info(JSON.stringify(copyConfig, null, 2));
  }

  return copyConfig;
}

module.exports = getConfig;
