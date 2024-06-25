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
  if (copyConfig.unpaywall.apikey === defaultConfig.unpaywall.apikey) {
    logger.warn('[config]: Unpaywall apikey has the default value');
  }

  if (copyConfig.mail.apikey === defaultConfig.mail.apikey) {
    logger.warn('[config]: Mail apikey has the default value');
  }

  if (copyConfig.elasticsearch.password === defaultConfig.elasticsearch.password) {
    logger.warn('[config]: elasticsearch password has the default value');
  }

  if (copyConfig.apikey === defaultConfig.apikey) {
    logger.warn('[config]: Apikey has the default value');
  }

  copyConfig.unpaywall.apikey = '********';
  copyConfig.mail.apikey = '********';
  copyConfig.elasticsearch.password = '********';
  copyConfig.apikey = '********';

  logger.info(JSON.stringify(copyConfig, null, 2));

  return copyConfig;
}

module.exports = getConfig;
