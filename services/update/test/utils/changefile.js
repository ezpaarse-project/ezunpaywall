const chai = require('chai');
const chaiHttp = require('chai-http');
const path = require('path');

chai.use(chaiHttp);

const checkIfInUpdate = require('./status');

const changefilesDir = path.resolve(__dirname, '..', 'sources', 'changefiles');

// TODO put it in config
const updateURL = process.env.UPDATE_HOST || 'http://localhost:59702';
const fakeUnpaywall = process.env.FAKEUNPAYWALL_URL || 'http://localhost:59799';

/**
 * Delete a snapshot in ezunpaywall.
 *
 * @param {Promise<string>} filename - Name of file needed to be delete on ezunpaywall.
 */
async function deleteChangefile(filename) {
  try {
    await chai.request(updateURL)
      .delete(`/changefiles/${filename}`)
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
async function addChangefile(filename) {
  try {
    await chai.request(updateURL)
      .post('/changefiles')
      .attach('file', path.resolve(changefilesDir, filename), filename)
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error(`Cannot POST ${updateURL}/snapshot ${err}`);
    process.exit(1);
  }
}

/**
 * Update the registry of changefiles of fakeUnpaywall.
 *
 * @param {string} interval - Interval of registry.
 *
 * @returns {Promise<void>}
 */
async function updateChangefile(interval) {
  try {
    await chai.request(fakeUnpaywall)
      .patch('/changefiles')
      .query({ interval });
  } catch (err) {
    console.error(`Cannot PATCH ${updateURL}/changefiles ${err}`);
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
async function insertChangefile(filename, index) {
  try {
    await chai.request(updateURL)
      .post(`/job/insert/changefile/${filename}`)
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

/**
 * insert file in ezunpaywall.
 *
 * @param {string} filename - Filename needed to be insert on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function insertInHistory(startDate, endDate) {
  try {
    await chai.request(updateURL)
      .post('/job/download/insert/history/period')
      .send({
        indexBase: 'unpaywall-base',
        startDate,
        endDate,
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
  addChangefile,
  deleteChangefile,
  updateChangefile,
  insertChangefile,
  insertInHistory,
};
