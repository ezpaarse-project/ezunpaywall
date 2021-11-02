const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const authURL = process.env.AUTH_URL || 'http://localhost:7000';

/**
 * load default dev apikey
 */
const load = async () => {
  try {
    await chai.request(authURL)
      .post('/load')
      .set('redis-password', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
};

/**
 * delete all apikey from redis
 */
const deleteAll = async () => {
  try {
    await chai.request(authURL)
      .delete('/all')
      .set('redis-password', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
};

module.exports = {
  load,
  deleteAll,
};
