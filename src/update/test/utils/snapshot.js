const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const snapshotsDir = path.resolve(__dirname, '..', 'sources');

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:4000';
const fakeUnpaywall = process.env.FAKEUNPAYWALL_URL || 'http://localhost:12000';

/**
 * delete a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be delete on ezunpaywall
 */
const deleteFile = async (filename) => {
  try {
    await chai.request(updateURL)
      .delete(`/snapshots/${filename}`);
  } catch (err) {
    console.error(`Cannot DELETE ${updateURL}/snapshot/${filename}`);
    process.exit(1);
  }
};

/**
 * add a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be add on ezunpaywall
 */
const addSnapshot = async (filename) => {
  try {
    await chai.request(updateURL)
      .post('/snapshots')
      .attach('file', path.resolve(snapshotsDir, filename), filename);
  } catch (err) {
    console.error(`Cannot POST ${updateURL}/snapshot ${err}`);
    process.exit(1);
  }
};

/**
 *
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
