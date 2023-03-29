const axios = require('axios');
const config = require('config');

const logger = require('../logger');

const apikey = config.get('mail.apikey');

const mail = axios.create({
  baseURL: config.get('mail.host'),
});
mail.host = config.get('mail.host');

async function sendMailUpdateReport(state) {
  let res;
  try {
    res = await mail({
      method: 'POST',
      url: '/update-end',
      data: state,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': apikey,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
  }

  return res?.body;
}

async function sendMailUpdateStarted(info) {
  let res;
  try {
    res = await mail({
      method: 'POST',
      url: '/update-start',
      data: info,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': apikey,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
  }
  return res?.body;
}

/**
 * Send a mail that inform that no changefile are avaiblable between the period.
 *
 * @param {String} startDate - Start date at format YYYY-mm-dd.
 * @param {String} endDate - Start date at format YYYY-mm-dd.
 *
 * @returns {String} Data response of mail service.
 */
async function sendMailNoChangefile(startDate, endDate) {
  let res;
  try {
    res = await mail({
      method: 'POST',
      url: '/nochangefile',
      data: { startDate, endDate },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': apikey,
      },
    });
  } catch (err) {
    logger.errorRequest(err);
  }
  return res?.body;
}

module.exports = {
  sendMailUpdateReport,
  sendMailUpdateStarted,
  sendMailNoChangefile,
};
