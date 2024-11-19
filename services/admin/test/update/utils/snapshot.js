const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const checkStatus = require('./status');

const snapshotsDir = path.resolve(__dirname, '..', 'sources', 'snapshots');

// TODO put it in config
const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';

/**
 * Delete a snapshot in ezunpaywall.
 *
 * @param {Promise<string>} filename Name of file needed to be delete on ezunpaywall.
 */
async function deleteSnapshot(filename) {
  try {
    await chai.request(adminURL)
      .delete(`/snapshots/${filename}`)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot DELETE ${adminURL}/snapshot/${filename}`);
    process.exit(1);
  }
}

/**
 * Add a snapshot in ezunpaywall.
 *
 * @param {string} filename Filename needed to be add on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function addSnapshot(filename) {
  try {
    await chai.request(adminURL)
      .post('/snapshots')
      .attach('file', path.resolve(snapshotsDir, filename), filename)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${adminURL}/snapshot ${err}`);
    process.exit(1);
  }
}

/**
 * insert file in ezunpaywall.
 *
 * @param {string} filename Filename needed to be insert on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function insertSnapshot(filename, index) {
  try {
    await chai.request(adminURL)
      .post(`/job/snapshot/insert/${filename}`)
      .send({
        index,
      })
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${adminURL}/snapshot ${err}`);
    process.exit(1);
  }
  let isUpdate = true;
  while (isUpdate) {
    await new Promise((resolve) => { setTimeout(resolve, 100); });
    isUpdate = await checkStatus();
  }
}

module.exports = {
  addSnapshot,
  deleteSnapshot,
  insertSnapshot,
};
