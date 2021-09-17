const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const snapshotsDir = path.resolve(__dirname, '..', 'sources');

// TODO put it in config
const updateURL = process.env.UPDATE_URL || 'http://localhost:4000';
const fakeUnpaywall = process.env.FAKEUNPAYWALL_URL || 'http://localhost:12000';

/**
 * delete a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be delete on ezunpaywall
 */
const deleteSnapshot = async (filename) => {
  try {
    await chai.request(updateURL)
      .delete(`/snapshot/${filename}`);
  } catch (err) {
    console.error(`deleteSnapshot: ${err}`);
  }
};

/**
 * add a snapshot in ezunpaywall
 * @param {String} filename name of file needed to be add on ezunpaywall
 */
const addSnapshot = async (filename) => {
  try {
    await chai.request(updateURL)
      .post('/snapshot')
      .attach('file', path.resolve(snapshotsDir, filename), filename);
  } catch (err) {
    console.error(`addSnapshot: ${err}`);
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
    console.error(`updateChangeFile: ${err}`);
  }
};

module.exports = {
  addSnapshot,
  deleteSnapshot,
  updateChangeFile,
};
