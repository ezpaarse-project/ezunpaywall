/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const readline = require('readline');
const { elasticsearch } = require('config');
const zlib = require('zlib');
const { paths } = require('config');

const appLogger = require('../logger/appLogger');
const unpaywallMapping = require('../../../mapping/unpaywall.json');

const {
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
} = require('./state');

const {
  refreshIndex,
  bulk,
  initAlias,
  createIndex,
} = require('../elastic');

const { indexAlias } = elasticsearch;
const { maxBulkSize } = elasticsearch;

/**
 * Insert data on elastic with elastic bulk request.
 *
 * @param {Array<Object>} data Array of unpaywall data.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertUnpaywallDataInElastic(data) {
  const step = getLatestStep();
  let res;

  try {
    res = await bulk(data);
  } catch (err) {
    appLogger.error('[elastic]: Cannot bulk', err);
    await fail(err);
    throw err;
  }

  const errors = [];
  const items = Array.isArray(res?.body?.items) ? res?.body?.items : [];

  items.forEach((i) => {
    if (i?.index?.result === 'created') {
      step.addedDocs += 1;
      return;
    }
    if (i?.index?.result === 'updated') {
      step.updatedDocs += 1;
      return;
    }

    if (i?.index?.error !== undefined) {
      step.failedDocs += 1;
      errors.push(i?.index?.error);
    }
  });

  if (errors.length > 0) {
    appLogger.error('[elastic]: Error in bulk insertion');
    errors.forEach((error) => {
      appLogger.error(`[elastic]: ${JSON.stringify(error, null, 2)}`);
    });
    step.status = 'error';
    updateLatestStep(step);
    await fail(errors);
    throw new Error('Error in bulk insertion');
  }

  updateLatestStep(step);

  return true;
}

/**
 * Inserts the contents of an unpaywall data update file.
 *
 * @param {Object} insertConfig Config of insertion.
 * @param {string} insertConfig.filename Name of the snapshot file from which the data will
 * be retrieved to be inserted into elastic.
 * @param {string} insertConfig.index Name of the index to which the data will be inserted.
 * @param {number} insertConfig.offset Line of the snapshot at which the data insertion starts.
 * @param {number} insertConfig.limit Line in the file where the insertion stops.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertDataUnpaywall(insertConfig) {
  const {
    filename, index, offset, limit, ignoreError, type,
  } = insertConfig;

  // step insertion in the state
  const start = new Date();
  addStepInsert(filename);
  const step = getLatestStep();
  step.file = filename;
  step.index = index;
  updateLatestStep(step);

  try {
    await createIndex(index, unpaywallMapping);
  } catch (err) {
    appLogger.error(`[insert][elastic][index]: Cannot create index [${index}]`, err);
    throw err;
  }

  try {
    await initAlias(index, unpaywallMapping, indexAlias);
  } catch (err) {
    appLogger.error(`[insert][elastic][alias]: Cannot create alias [${index}]`, err);
    throw err;
  }

  let filePath;

  if (type === 'changefile') {
    filePath = path.resolve(paths.data.changefilesDir, filename);
  }

  if (type === 'snapshot') {
    filePath = path.resolve(paths.data.snapshotsDir, filename);
  }

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fsp.stat(filePath);
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot get bytes [${filePath}]`, err);
    await fail(err);
    throw err;
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot read [${filePath}]`, err);
    await fail(err);
    throw err;
  }

  // get information "loaded" for state
  let loaded = 0;
  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  let decompressedStream;
  try {
    decompressedStream = readStream.pipe(zlib.createGunzip());
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot pipe [${readStream?.filename}]`, err);
    await fail(err);
    throw err;
  }

  const rl = readline.createInterface({
    input: decompressedStream,
    crlfDelay: Infinity,
  });

  // array that will contain the packet of 1000 unpaywall data
  let bulkOps = [];

  let success;

  appLogger.info(`[job][insert]: Start insert with [${filename}]`);

  // Reads line by line the output of the decompression stream to make packets of 1000
  // to insert them in bulk in an elastic
  for await (const line of rl) {
    // limit
    if (step.linesRead === limit) {
      break;
    }

    step.linesRead += 1;

    // offset
    if (step.linesRead >= offset + 1) {
      // fill the array
      try {
        const doc = JSON.parse(line);
        doc.referencedAt = doc.updated;
        if (!doc.updated) { appLogger.error('[job][insert]: no update is send'); }
        bulkOps.push({ index: { _index: index, _id: doc.doi } });
        bulkOps.push(doc);
      } catch (err) {
        appLogger.error(`[job][insert]: Cannot parse [${line}] in json format`, err);
        if (!ignoreError) {
          await fail(err);
          throw err;
        }
      }
    }
    // bulk insertion
    if (bulkOps.length >= maxBulkSize) {
      success = await insertUnpaywallDataInElastic(bulkOps, step);
      bulkOps = [];
      if (!success) {
        throw new Error('Cannot insert unpaywall data in elastic');
      }
      step.percent = ((loaded / bytes.size) * 100).toFixed(2);
      step.took = (new Date() - start) / 1000;
      updateLatestStep(step);
    }
    if (step.linesRead % 100000 === 0) {
      appLogger.info(`[job][insert]: ${step.linesRead} Lines reads`);
      updateLatestStep(step);
    }
  }
  // last insertion if there is data left
  if (bulkOps.length > 0) {
    success = await insertUnpaywallDataInElastic(bulkOps, step);
    bulkOps = [];
    if (!success) return false;
  }

  appLogger.info('[job][insert]: insertion completed');

  try {
    await refreshIndex();
  } catch (err) {
    appLogger.warn('[elastic]: Cannot refresh the index', err);
  }

  // last update of step
  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  step.percent = 100;
  updateLatestStep(step);
  return true;
}

module.exports = insertDataUnpaywall;
