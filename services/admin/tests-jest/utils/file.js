const path = require('path');
const request = require('supertest');
const { apikey } = require('config');
const app = require('../../src/app');

const changefilesDir = path.resolve(__dirname, 'data', 'changefiles');

/**
 * Add a changefile in ezunpaywall.
 *
 * @param {string} filename Filename needed to be add on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function addChangefile(filename) {
  const filepath = path.resolve(changefilesDir, filename);
  try {
    await request(app)
      .post('/changefiles')
      .attach('file', filepath, filename)
      .set('x-api-key', apikey);
  } catch (err) {
    console.error(`[test][utils][changefiles]: Cannot add changefile ${filename}`);
    console.error(err);
  }
}

/**
 * Get changefiles in ezunpaywall.
 */
async function getChangefiles() {
  let response;
  try {
    response = await request(app)
      .get('/changefiles')
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][changefile]: Cannot get changefile');
    console.error(err);
  }
  return response.body;
}

module.exports = {
  addChangefile,
  getChangefiles,
};
