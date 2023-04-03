const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

/**
 * Get config of service.
 * @param {boolean} verbose indicate verbose or not.
 *
 * @returns {Object} Config of service.
 */
function getConfig(verbose) {
  if (verbose) {
    if (copyConfig.apikey === defaultConfig.apikey) {
      logger.warn('[config]: Apikey has the default value');
    }
  }

  copyConfig.apikey = '********';

  if (verbose) {
    logger.info(JSON.stringify(copyConfig, null, 2));
  }

  return copyConfig;
}

module.exports = getConfig;
