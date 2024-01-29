/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const config = require('config');
const zlib = require('zlib');

const dirPath = require('./path');
const logger = require('./logger');
const unpaywallMapping = require('../mapping/unpaywall.json');

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
} = require('./services/elastic');

const indexAlias = config.get('elasticsearch.indexAlias');
const maxBulkSize = config.get('elasticsearch.maxBulkSize');

const { snapshotsDir } = dirPath;

/**
 * Insert data on elastic with elastic bulk request.
 *
 * @param {Array<Object>} data - Array of unpaywall data.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertUnpaywallDataInElastic(data) {
  const step = getLatestStep();
  let res;
  try {
    res = await bulk(data);
  } catch (err) {
    logger.error('[elastic] Cannot bulk', err);
    await fail(err?.[0]?.reason);
    return false;
  }

  const errors = [];
  const items = Array.isArray(res?.body?.items) ? res?.body?.items : [];

  items.forEach((i) => {
    if (i?.index?.result === 'created') {
      step.insertedDocs += 1;
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
    logger.error('[elastic] Error in bulk insertion');
    errors.forEach((error) => {
      logger.error(`[elastic] ${JSON.stringify(error, null, 2)}`);
    });
    step.status = 'error';
    updateLatestStep(step);
    await fail(errors);
    return false;
  }

  updateLatestStep(step);

  return true;
}

/**
 * Inserts the contents of an unpaywall data update file.
 *
 * @param {Object} insertConfig - Config of insertion.
 * @param {string} insertConfig.filename - Name of the snapshot file from which the data will
 * be retrieved to be inserted into elastic.
 * @param {string} insertConfig.index - Name of the index to which the data will be inserted.
 * @param {number} insertConfig.offset - Line of the snapshot at which the data insertion starts.
 * @param {number} insertConfig.limit - Line in the file where the insertion stops.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertDataUnpaywall(insertConfig) {
  const {
    filename, index, offset, limit,
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
    logger.error(`[elastic] Cannot create index [${index}]`, err);
    await fail(err);
    return false;
  }

  await initAlias(index, unpaywallMapping, indexAlias);

  const filePath = path.resolve(snapshotsDir, filename);

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`[job][insert]: Cannot get bytes [${filePath}]`, err);
    await fail(err);
    return false;
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.error(`[job][insert]: Cannot read [${filePath}]`, err);
    await fail(err);
    return false;
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
    logger.error(`[job][insert]: Cannot pipe [${readStream?.filename}]`, err);
    await fail(err);
    return false;
  }

  const rl = readline.createInterface({
    input: decompressedStream,
    crlfDelay: Infinity,
  });

  // array that will contain the packet of 1000 unpaywall data
  let bulkOps = [];

  let success;

  logger.info(`[job][insert]: Start insert with [${filename}]`);

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
        bulkOps.push({ index: { _index: index, _id: doc.doi } });
        bulkOps.push(doc);
      } catch (err) {
        logger.error(`[job][insert]: Cannot parse [${line}] in json format`, err);
        await fail(err);
        return false;
      }
    }
    // bulk insertion
    if (bulkOps.length >= maxBulkSize) {
      success = await insertUnpaywallDataInElastic(bulkOps, step);
      bulkOps = [];
      if (!success) return false;
      step.percent = ((loaded / bytes.size) * 100).toFixed(2);
      step.took = (new Date() - start) / 1000;
      updateLatestStep(step);
    }
    if (step.linesRead % 100000 === 0) {
      logger.info(`[job][insert]: ${step.linesRead} Lines reads`);
      updateLatestStep(step);
    }
  }
  // last insertion if there is data left
  if (bulkOps.length > 0) {
    success = await insertUnpaywallDataInElastic(bulkOps, step);
    bulkOps = [];
    if (!success) return false;
  }

  logger.info('[job][insert]: insertion completed');

  try {
    await refreshIndex();
  } catch (err) {
    logger.warn('[elastic] Cannot refresh the index', err);
  }

  // last update of step
  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  step.percent = 100;
  updateLatestStep(step);
  return true;
}

module.exports = insertDataUnpaywall;
