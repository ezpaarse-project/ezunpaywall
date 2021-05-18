const chai = require('chai');

const { logger } = require('../../lib/logger');

const ezunpaywallURL = process.env.EZUNPAYWALL_URL;

const getState = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/enrich/state');
  } catch (err) {
    logger.error(`getState : ${err}`);
  }
  return res?.body?.state;
};
module.exports = {
  getState,
};
