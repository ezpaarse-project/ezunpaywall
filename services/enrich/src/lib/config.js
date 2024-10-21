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
  copyConfig.redis.password = '********';
  copyConfig.apikey = '********';
  return copyConfig;
}

function logConfig() {
  if (appConfig.redis.password === defaultConfig.redis.password) {
    appLogger.warn('[config]: Redis password has the default value');
  }

  if (appConfig.apikey === defaultConfig.apikey) {
    appLogger.warn('[config]: Admin API key has the default value');
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
