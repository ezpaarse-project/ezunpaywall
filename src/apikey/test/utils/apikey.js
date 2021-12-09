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
      .post('/load?dev=true')
      .set('redis-password', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
};

/**
 * delete all apikey from redis
 */
const deleteAllAPIKey = async () => {
  try {
    await chai.request(apikeyURL)
      .delete('/all')
      .set('redis-password', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
};

module.exports = {
  loadDevAPIKey,
  deleteAllAPIKey,
};