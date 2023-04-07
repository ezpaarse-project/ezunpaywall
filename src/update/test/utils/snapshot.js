const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const snapshotsDir = path.resolve(__dirname, '..', 'sources');

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';
const fakeUnpaywall = process.env.FAKEUNPAYWALL_URL || 'http://localhost:59799';

/**
 * Delete a snapshot in ezunpaywall.
 *
 * @param {string} filename name of file needed to be delete on ezunpaywall.
 */
const deleteFile = async (filename) => {
  try {
    await chai.request(updateURL)
      .delete(`/snapshots/${filename}`)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot DELETE ${updateURL}/snapshot/${filename}`);
    process.exit(1);
  }
};

/**
 * Add a snapshot in ezunpaywall.
 *
 * @param {string} filename - Filename needed to be add on ezunpaywall.
 */
const addSnapshot = async (filename) => {
  try {
    await chai.request(updateURL)
      .post('/snapshots')
      .attach('file', path.resolve(snapshotsDir, filename), filename)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${updateURL}/snapshot ${err}`);
    process.exit(1);
  }
};

/**
 * Update the registry of changefiles of fakeUnpaywall.
 *
 * @param {string} interval - Interval of registry.
 */
const updateChangeFile = async (interval) => {
  try {
    await chai.request(fakeUnpaywall)
      .patch('/changefiles')
      .query({ interval });
  } catch (err) {
    console.error(`Cannot PATCH ${updateURL}/changefiles ${err}`);
    process.exit(1);
  }
};

module.exports = {
  addSnapshot,
  deleteFile,
  updateChangeFile,
};
