const path = require('path');
const fs = require('fs');
const request = require('supertest');
const { apikey, paths } = require('config');
const app = require('../../src/app');
const { getStatus } = require('./job');

const changefilesDir = path.resolve(__dirname, 'sources', 'changefiles');
const snapshotsDir = path.resolve(__dirname, 'sources', 'snapshots');

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
    console.error('[test][utils][changefiles]: Cannot get changefile');
    console.error(err);
  }
  return response.body;
}

/**
 * Remove changefile in ezunpaywall.
 *
 * @param {string} filename Name of changefile need to be delete on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function removeChangefile(filename) {
  const filepath = path.resolve(paths.data.changefilesDir, filename);
  try {
    await fs.promises.unlink(filepath);
  } catch (err) {
    console.error(`[test][utils][changefiles]: Cannot delete changefile ${filename}`);
    console.error(err);
  }
}

/**
 * Add a snapshot in ezunpaywall.
 *
 * @param {string} filename Name of snapshot need to be add on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function addSnapshot(filename) {
  const filepath = path.resolve(snapshotsDir, filename);
  try {
    await request(app)
      .post('/snapshots')
      .attach('file', filepath, filename)
      .set('x-api-key', apikey);
  } catch (err) {
    console.error(`[test][utils][changefiles]: Cannot add snapshot ${filename}`);
    console.error(err);
  }
}

/**
 * Add a snapshot in ezunpaywall.
 *
 * @param {string} filename Name of snapshot need to be delete on ezunpaywall.
 *
 * @returns {Promise<void>}
 */
async function removeSnapshot(filename) {
  const filepath = path.resolve(snapshotsDir, filename);
  try {
    await request(app)
      .post('/snapshots')
      .attach('file', filepath, filename)
      .set('x-api-key', apikey);
  } catch (err) {
    console.error(`[test][utils][changefiles]: Cannot remove snapshot ${filename}`);
    console.error(err);
  }
}

/**
 * Get snapshots in ezunpaywall.
 */
async function getSnapshots() {
  let response;
  try {
    response = await request(app)
      .get('/snapshots')
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][snapshots]: Cannot get snapshots');
    console.error(err);
  }
  return response.body;
}
/**
 * insert snapshot in ezunpaywall.
 *
 * @param {string} filename Filename needed to be insert on ezunpaywall.
 */
async function insertSnapshot(filename, index) {
  // TODO 2025-02-17 - don't use api call to insert file in elastic
  try {
    await request(app)
      .post(`/job/snapshots/insert/${filename}`)
      .send({
        index,
      })
      .set('x-api-key', 'changeme');
  } catch (err) {
    console.error('[test][utils][snapshots]: Cannot insert snapshot');
    console.error(err);
  }
  let isUpdate = true;
  while (isUpdate) {
    await new Promise((resolve) => { setTimeout(resolve, 100); });
    isUpdate = await getStatus();
  }
}

module.exports = {
  addChangefile,
  getChangefiles,
  removeChangefile,
  addSnapshot,
  removeSnapshot,
  getSnapshots,
  insertSnapshot,
};
