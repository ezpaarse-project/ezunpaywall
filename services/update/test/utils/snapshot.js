const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const checkIfInUpdate = require('./status');

const snapshotsDir = path.resolve(__dirname, '..', 'sources', 'snapshots');

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';

/**
 * Delete a snapshot in ezunpaywall.
 *
 * @param {Promise<string>} filename - Name of file needed to be delete on ezunpaywall.
 */
async function deleteSnapshot(filename) {
  try {
    await chai.request(updateURL)
      .delete(`/snapshots/${filename}`)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot DELETE ${updateURL}/snapshot/${filename}`);
    process.exit(1);
  }
}

/**
 * Add a snapshot in ezunpaywall.
 *
 * @param {string} filename - Filename needed to be add on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function addSnapshot(filename) {
  try {
    await chai.request(updateURL)
      .post('/snapshots')
      .attach('file', path.resolve(snapshotsDir, filename), filename)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${updateURL}/snapshot ${err}`);
    process.exit(1);
  }
}

/**
 * insert file in ezunpaywall.
 *
 * @param {string} filename - Filename needed to be insert on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function insertSnapshot(filename, index) {
  try {
    await chai.request(updateURL)
      .post(`/job/insert/snapshot/${filename}`)
      .send({
        index,
      })
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${updateURL}/snapshot ${err}`);
    process.exit(1);
  }
  let isUpdate = true;
  while (isUpdate) {
    await new Promise((resolve) => { setTimeout(resolve, 100); });
    isUpdate = await checkIfInUpdate();
  }
}

module.exports = {
  addSnapshot,
  deleteSnapshot,
  insertSnapshot,
};
