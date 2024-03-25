const axios = require('axios');
const config = require('config');

const logger = require('../logger');

const apikey = config.get('mail.apikey');

const mail = axios.create({
  baseURL: config.get('mail.host'),
});
mail.host = config.get('mail.host');

/**
 * Ping mail service.
 *
 * @returns {Promise<boolean>} healthy or not.
 */
async function pingMail() {
  let res;
  try {
    res = await mail({
      method: 'GET',
      url: '/ping',
    });
  } catch (err) {
    logger.error('[mail] Cannot ping mail', err);
    return err?.message;
  }
  if (res?.status === 204) return true;
  return false;
}

/**
 * Send update mail report.
 *
 * @param {Object} state - Report of update process.
 *
 * @returns {Promise<string>} Data response of mail service.
 */
async function sendMailUpdateReport(state) {
  return mail({
    method: 'POST',
    url: '/update-end',
    data: state,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-api-key': apikey,
    },
  });
}

/**
 * Send a mail that inform that an update has started start.
 *
 * @param {Object} info - Config of job.
 *
 * @returns {Promise<string>} Data response of mail service.
 */
async function sendMailUpdateStarted(info) {
  return mail({
    method: 'POST',
    url: '/update-start',
    data: info,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-api-key': apikey,
    },
  });
}

/**
 * Send a mail that inform that no changefile are avaiblable between the period.
 *
 * @param {string} startDate - Start date at format YYYY-mm-dd.
 * @param {string} endDate - Start date at format YYYY-mm-dd.
 *
 * @returns {Promise<string>} Data response of mail service.
 */
function sendMailNoChangefile(startDate, endDate) {
  return mail({
    method: 'POST',
    url: '/nochangefile',
    data: { startDate, endDate },
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'x-api-key': apikey,
    },
  });
}

module.exports = {
  pingMail,
  sendMailUpdateReport,
  sendMailUpdateStarted,
  sendMailNoChangefile,
};
