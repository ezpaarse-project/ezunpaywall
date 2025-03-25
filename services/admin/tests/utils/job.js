const request = require('supertest');
const { apikey } = require('config');
const app = require('../../src/app');

/**
 * Check is Status.
 *
 * @returns {Promise<void>}
 */
async function getStatus() {
  let response;
  try {
    response = await request(app)
      .get('/job/status')
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][status]: Cannot get status');
    console.error(err);
  }
  return response.body;
}

/**
 * get report of update
 *
 * @returns {Promise{Object}} report
 */
async function getReport(type) {
  let response;
  try {
    response = await request(app)
      .get(`/reports?type=${type}`)
      .query({ latest: true });
  } catch (err) {
    console.error('[test][utils][report]: Cannot get report');
    console.error(err);
  }
  return response?.body;
}

/**
 * Get state of update.
 *
 * @returns {Promise<Object>} state
 */
async function getState() {
  let response;
  try {
    response = await request(app)
      .get('/states')
      .query({ latest: true });
  } catch (err) {
    console.error('[test][utils][state]: Cannot get state');
    console.error(err);
  }
  return response?.body;
}

module.exports = {
  getStatus,
  getReport,
  getState,
};
