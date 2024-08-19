const config = require('config');

const appLogger = require('./logger/appLogger');
const defaultConfig = require('../../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

/**
 * Get config of service.
 *
 * @returns {Object} Config of service.
 */
function getConfig() {
  if (copyConfig.unpaywall.apikey === defaultConfig.unpaywall.apikey) {
    appLogger.warn('[config]: Unpaywall apikey has the default value');
  }

  if (copyConfig.elasticsearch.password === defaultConfig.elasticsearch.password) {
    appLogger.warn('[config]: Elasticsearch password has the default value');
  }

  if (copyConfig.apikey === defaultConfig.apikey) {
    appLogger.warn('[config]: Apikey has the default value');
  }

  if (copyConfig.redis.password === defaultConfig.redis.password) {
    appLogger.warn('[config]: Redis password has the default value');
  }

  copyConfig.unpaywall.apikey = '********';
  copyConfig.elasticsearch.password = '********';
  copyConfig.redis.password = '********';
  copyConfig.apikey = '********';

  appLogger.info(JSON.stringify(copyConfig, null, 2));

  return copyConfig;
}

module.exports = getConfig;
