const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);

const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

/**
 * Load default dev apikey.
 *
 * @returns {Promise<void>}
 */
async function loadDevAPIKey() {
  try {
    await chai.request(adminURL)
      .post('/apikeys/loadDev')
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
}

/**
 * Delete all apikey from redis.
 *
 * @returns {Promise<void>}
 */
async function deleteAllAPIKey() {
  try {
    await chai.request(adminURL)
      .delete('/apikeys')
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error('Cannot request apikey service');
    console.error(err);
  }
}

module.exports = {
  loadDevAPIKey,
  deleteAllAPIKey,
};
