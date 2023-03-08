const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function logConfig(verbose) {
  if (verbose) {
    if (copyConfig.apikey === defaultConfig.apikey) {
      logger.warn('[config]: Apikey is the default value');
    }
  }

  copyConfig.apikey = '********';

  if (verbose) {
    logger.info(JSON.stringify(copyConfig, null, 2));
  }

  return copyConfig;
}

module.exports = logConfig;
