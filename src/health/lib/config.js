const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function logConfig(verbose) {
  if (verbose) {
    if (copyConfig.redis.password === defaultConfig.redis.password) {
      logger.warn('[config]: Redis password is the default value');
    }
    if (copyConfig.elasticsearch.password === defaultConfig.elasticsearch.password) {
      logger.warn('[config]: Elastic password is the default value');
    }
    if (copyConfig.unpaywall.apikey === defaultConfig.unpaywall.apikey) {
      logger.warn('[config]: Unpaywall apikey is the default value');
    }
  }

  copyConfig.redis.password = '********';
  copyConfig.elasticsearch.password = '********';
  copyConfig.unpaywall.apikey = '********';

  if (verbose) {
    logger.info(JSON.stringify(copyConfig, null, 2));
  }

  return copyConfig;
}

module.exports = logConfig;
