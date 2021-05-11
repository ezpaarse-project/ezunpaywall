const chai = require('chai');

const { logger } = require('../../lib/logger');

const ezunpaywallURL = 'http://localhost:8080';

const getStateOfEnrich = async () => {
  let res;
  try {
    res = await chai.request(ezunpaywallURL).get('/enrich/state');
  } catch (err) {
    logger.error(`isInUpdate : ${err}`);
  }
  return res?.body?.state;
};

module.exports = {
  getStateOfEnrich,
};
