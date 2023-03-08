const config = require('config');

const logger = require('./logger');
const defaultConfig = require('../config/default.json');

const copyConfig = JSON.parse(JSON.stringify(config));

function showConfig() {
  if (copyConfig.unpaywall.apikey === defaultConfig.unpaywall.apikey) {
    logger.warn('[config]: Unpaywall apikey is the default value');
  } else {
    copyConfig.unpaywall.apikey = '********';
  }

  if (copyConfig.mail.apikey === defaultConfig.mail.apikey) {
    logger.warn('[config]: Mail apikey is the default value');
  } else {
    copyConfig.mail.apikey = '********';
  }

  if (copyConfig.elasticsearch.apikey === defaultConfig.elasticsearch.apikey) {
    logger.warn('[config]: elasticsearch password is the default value');
  } else {
    copyConfig.elasticsearch.apikey = '********';
  }

  if (copyConfig.apikey === defaultConfig.apikey) {
    logger.warn('[config]: Apikey is the default value');
  } else {
    copyConfig.apikey = '********';
  }

  logger.info(JSON.stringify(copyConfig, null, 2));
}

module.exports = showConfig;
