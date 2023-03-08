const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function logConfig(verbose) {
  if (verbose) {
    if (copyConfig.unpaywall.apikey === defaultConfig.unpaywall.apikey) {
      logger.warn('[config]: Unpaywall apikey is the default value');
    }

    if (copyConfig.mail.apikey === defaultConfig.mail.apikey) {
      logger.warn('[config]: Mail apikey is the default value');
    }

    if (copyConfig.elasticsearch.apikey === defaultConfig.elasticsearch.apikey) {
      logger.warn('[config]: elasticsearch password is the default value');
    }

    if (copyConfig.apikey === defaultConfig.apikey) {
      logger.warn('[config]: Apikey is the default value');
    }
  }

  copyConfig.unpaywall.apikey = '********';
  copyConfig.mail.apikey = '********';
  copyConfig.elasticsearch.apikey = '********';
  copyConfig.apikey = '********';

  if (verbose) {
    logger.info(JSON.stringify(copyConfig, null, 2));
  }

  return copyConfig;
}

module.exports = logConfig;
