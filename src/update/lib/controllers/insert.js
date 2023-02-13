/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const config = require('config');
const zlib = require('zlib');

const logger = require('../logger');
const unpaywallMapping = require('../../mapping/unpaywall.json');

const {
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
} = require('../models/state');

const {
  elasticClient,
  createIndex,
} = require('../services/elastic');

const indexAlias = config.get('elasticsearch.indexAlias');
const maxBulkSize = config.get('elasticsearch.maxBulkSize');

const snapshotsDir = path.resolve(__dirname, '..', '..', 'data', 'snapshots');

/**
 * insert data on elastic with elastic bulk request
 * @param {Array} data array of unpaywall data
 * @param {String}  - state filename
 */
const insertDataInElastic = async (data) => {
  const step = getLatestStep();
  let res;
  try {
    res = await elasticClient.bulk({ body: data });
  } catch (err) {
    logger.error('Cannot bulk on elastic');
    logger.error(err);
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
    logger.error('Error in bulk insertion');
    errors.forEach((error) => {
      logger.error(JSON.stringify(error, null, 2));
    });
    step.status = 'error';
    updateLatestStep(step);
    await fail(errors);
    return false;
  }

  updateLatestStep(step);

  return true;
};

/**
 * Inserts the contents of an unpaywall data update file
 * @param {String}  - state filename
 * @param {String} index name of the index to which the data will be saved
 * @param {String} filename - snapshot filename which the data will be inserted
 * @param {Integer} offset - offset
 * @param {Integer} limit - limit
 */
const insertDataUnpaywall = async (insertConfig) => {
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
    logger.error(`Cannot create index [${index}]`);
    logger.error(err);
    await fail(err);
    return false;
  }

  try {
    const { body: aliasExists } = await elasticClient.indices.existsAlias({ name: indexAlias });

    if (aliasExists) {
      logger.info(`Alias [${indexAlias}] already exists`);
    } else {
      logger.info(`Creating alias [${indexAlias}] pointing to index [${index}]`);
      await elasticClient.indices.putAlias({ index, name: indexAlias });
    }
  } catch (err) {
    logger.error(`Cannot create alias [${indexAlias}] pointing to index [${index}]`);
    logger.error(err);
    await fail(err);
    return false;
  }

  const filePath = path.resolve(snapshotsDir, filename);

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`Cannot stat ${filePath}`);
    logger.error(err);
    await fail(err);
    return false;
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.error(`Cannot read ${filePath}`);
    logger.error(err);
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
    logger.error(`Cannot pipe ${readStream?.filename}`);
    logger.error(err);
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

  logger.info(`Start insert with ${filename}`);

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
        bulkOps.push({ index: { _index: index, _id: doc.doi } });
        bulkOps.push(doc);
      } catch (err) {
        logger.error(`Cannot parse "${line}" in json format`);
        logger.error(err);
        await fail(err);
        return false;
      }
    }
    // bulk insertion
    if (bulkOps.length >= maxBulkSize) {
      const dataToInsert = bulkOps.slice();
      bulkOps = [];
      success = await insertDataInElastic(dataToInsert, step);
      if (!success) return false;
      step.percent = ((loaded / bytes.size) * 100).toFixed(2);
      step.took = (new Date() - start) / 1000;
      updateLatestStep(step);
    }
    if (step.linesRead % 100000 === 0) {
      logger.info(`${step.linesRead} Lines reads`);
      updateLatestStep(step);
    }
  }
  // last insertion if there is data left
  if (bulkOps.length > 0) {
    success = await insertDataInElastic(bulkOps, step);
    if (!success) return false;
    bulkOps = [];
  }

  logger.info('step - end insertion');

  try {
    await elasticClient.indices.refresh({ index });
  } catch (e) {
    logger.warn(`step - failed to refresh the index: ${e.message}`);
  }

  // last update of step
  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  step.percent = 100;
  updateLatestStep(step);
  return true;
};

module.exports = insertDataUnpaywall;
