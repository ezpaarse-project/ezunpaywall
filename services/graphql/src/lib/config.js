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
  copyConfig.elasticsearch.apiKey = '********';
  copyConfig.redis.password = '********';
  copyConfig.apikey = '********';
  return copyConfig;
}

/**
 * Get config of service.
 *
 * @returns {Object} Config of service.
 */
function logConfig() {
  if (appConfig.redis.password === defaultConfig.redis.password) {
    appLogger.warn('[config]: Redis password has the default value');
  }
  if (appConfig.elasticsearch.apiKey === defaultConfig.elasticsearch.apiKey) {
    appLogger.warn('[config]: Elastic API key has the default value');
  }
  if (appConfig.apikey === defaultConfig.apikey) {
    appLogger.warn('[config]: Admin API key has the default value');
  }

  const appConfigFiltered = hideSecret(appConfig);

  appLogger.info(JSON.stringify(appConfigFiltered, null, 2));
}

/**
 * Log config of service.
 */
function getConfig() {
  return hideSecret(appConfig);
}

module.exports = {
  getConfig,
  logConfig,
};
