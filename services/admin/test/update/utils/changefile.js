const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const checkStatus = require('./status');

const changefilesDir = path.resolve(__dirname, '..', 'sources', 'changefiles');

// TODO put it in config
const adminURL = process.env.ADMIN_URL || 'http://localhost:59703';
const fakeUnpaywall = process.env.FAKEUNPAYWALL_URL || 'http://localhost:59799';

/**
 * Delete a snapshot in ezunpaywall.
 *
 * @param {Promise<string>} filename Name of file needed to be delete on ezunpaywall.
 */
async function deleteChangefile(filename) {
  try {
    await chai.request(adminURL)
      .delete(`/changefiles/${filename}`)
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
async function addChangefile(filename) {
  try {
    await chai.request(adminURL)
      .post('/changefiles')
      .attach('file', path.resolve(changefilesDir, filename), filename)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${adminURL}/snapshot ${err}`);
    process.exit(1);
  }
}

/**
 * Update the registry of changefiles of fakeUnpaywall.
 *
 * @param {string} interval Interval of registry.
 *
 * @returns {Promise<void>}
 */
async function updateChangefile(interval) {
  try {
    await chai.request(fakeUnpaywall)
      .patch('/changefiles')
      .query({ interval });
  } catch (err) {
    console.error(`Cannot PATCH ${adminURL}/changefiles ${err}`);
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
async function insertChangefile(filename, index) {
  try {
    await chai.request(adminURL)
      .post(`/job/changefile/insert/${filename}`)
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

/**
 * insert file in ezunpaywall.
 *
 * @param {string} filename Filename needed to be insert on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function insertInHistory(startDate, endDate) {
  try {
    await chai.request(adminURL)
      .post('/job/changefile/history/download/insert')
      .send({
        index: 'unpaywall-base',
        startDate,
        endDate,
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
  addChangefile,
  deleteChangefile,
  updateChangefile,
  insertChangefile,
  insertInHistory,
};
