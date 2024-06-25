const config = require('config');

const logger = require('./logger/appLogger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

/**
 * Get config of service.
 *
 * @returns {Object} Config of service.
 */
function getConfig() {
  if (copyConfig.apikey === defaultConfig.apikey) {
    logger.warn('[config]: Apikey has the default value');
  }

  copyConfig.apikey = '********';

  logger.info(JSON.stringify(copyConfig, null, 2));

  return copyConfig;
}

module.exports = getConfig;
