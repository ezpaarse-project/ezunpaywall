const axios = require('axios');
const { mail } = require('config');

const logger = require('../lib/logger');

async function sendMailReport(state) {
  let res;
  try {
    res = await axios({
      method: 'POST',
      url: `${mail?.baseURL}/update-end`,
      data: state,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': mail?.apikey,
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
    res = await axios({
      method: 'POST',
      url: `${mail?.baseURL}/update-start`,
      data: info,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': mail?.apikey,
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
