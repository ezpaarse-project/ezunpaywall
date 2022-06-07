const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const apikeyURL = process.env.AUTH_URL || 'http://localhost:7000';

/**
 * load default dev apikey
 */
const loadDevAPIKey = async () => {
  try {
    await chai.request(apikeyURL)
      .post('/keys/load?dev=true')
      .set('redis-password', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
    process.exit(1);
  }
};

/**
 * delete all apikey from redis
 */
const deleteAllAPIKey = async () => {
  try {
    await chai.request(apikeyURL)
      .delete('/keys/all')
      .set('redis-password', 'changeme');
  } catch (err) {
    console.error(`Cannot DELETE ${apikeyURL}/all ${err}`);
    process.exit(1);
  }
};

module.exports = {
  loadDevAPIKey,
  deleteAllAPIKey,
};
