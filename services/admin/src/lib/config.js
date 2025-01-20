const config = require('config');

const appLogger = require('./logger/appLogger');
const defaultConfig = require('../../config/default.json');

const appConfig = JSON.parse(JSON.stringify(config));

/**
 * Hides sensitive value on config.
 *
 * @param conf App config.
 *
 * @returns Config with hidden sensitive values.
 */
function hideSecret(conf) {
  const copyConfig = { ...conf };
  copyConfig.unpaywall.apikey = '********';
  copyConfig.elasticsearch.password = '********';
  copyConfig.redis.password = '********';
  copyConfig.apikey = '********';
  return copyConfig;
}

/**
 * Log config of service.
 */
function logConfig() {
  if (appConfig.unpaywall.apikey === defaultConfig.unpaywall.apikey) {
    appLogger.warn('[config]: Unpaywall apikey has the default value');
  }

  if (appConfig.elasticsearch.password === defaultConfig.elasticsearch.password) {
    appLogger.warn('[config]: Elasticsearch password has the default value');
  }

  if (appConfig.apikey === defaultConfig.apikey) {
    appLogger.warn('[config]: Apikey has the default value');
  }

  if (appConfig.redis.password === defaultConfig.redis.password) {
    appLogger.warn('[config]: Redis password has the default value');
  }

  const appConfigFiltered = hideSecret(appConfig);

  appLogger.info(JSON.stringify(appConfigFiltered, null, 2));
}

/**
 * Get config of service without sensitive value.
 *
 * @returns {Object} Config of service.
 */
function getConfig() {
  return hideSecret(appConfig);
}

module.exports = {
  logConfig,
  getConfig,
};
