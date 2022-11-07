const axios = require('axios');
const config = require('config');

const logger = require('../logger');

const apikey = config.get('mail.apikey');

const mail = axios.create({
  baseURL: config.get('mail.host'),
});
mail.host = config.get('mail.host');

async function sendMailReport(state) {
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

async function sendMailStarted(info) {
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

module.exports = {
  sendMailReport,
  sendMailStarted,
};
