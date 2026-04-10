/* eslint-disable global-require */
const config = require('config');
const { format } = require('date-fns');
const appLogger = require('../logger/appLogger');
const getUnpaywallClient = require('./client');

const { apikey } = config.unpaywall;

const unpaywall = getUnpaywallClient();

/**
 * Ping unpaywall.
 *
 * @returns {Promise<boolean>} healthy or not.
 */
async function pingUnpaywall() {
  try {
    await unpaywall({
      method: 'GET',
      url: '/',
    });
    return true;
  } catch (err) {
    appLogger.error('[unpaywall] Cannot ping unpaywall', err);
    return false;
  }
}

module.exports = {
  pingUnpaywall,
};
