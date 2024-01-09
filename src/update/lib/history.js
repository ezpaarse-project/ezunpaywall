/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const config = require('config');
const zlib = require('zlib');
const { format } = require('date-fns');

const dirPath = require('./path');
const logger = require('./logger');
const unpaywallEnrichedMapping = require('../mapping/unpaywall.json');
const unpaywallHistoryMapping = require('../mapping/unpaywall_history.json');

const {
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
} = require('./state');

const {
  refreshIndex,
  getDataByListOfDOI,
  bulk,
  createIndex,
  searchWithRange,
} = require('./services/elastic');

const maxBulkSize = config.get('elasticsearch.maxBulkSize');

const { snapshotsDir } = dirPath.unpaywallHistory;

/**
 * Insert data on elastic with elastic bulk request.
 *
 * @param {Array<Object>} data - Array of unpaywall data.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertUnpaywallDataInElastic(data, index) {
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
      step.index[index].insertedDocs += 1;
      return;
    }
    if (i?.index?.result === 'updated') {
      step.index[index].updatedDocs += 1;
      return;
    }

    if (i?.index?.error !== undefined) {
      step.index[index].failedDocs += 1;
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
 * // TODO DOC
 * @param {*} listOfDoi
 * @param {*} newData
 * @param {*} date
 * @param {*} step
 * @returns
 */
async function insertData(listOfDoi, newData, date) {
  // TODO not hardcode
  const oldData = await getDataByListOfDOI(listOfDoi, 'unpaywall_enriched');

  const resHistoryData = [];
  const resData = [];

  if (!oldData) {
    newData.forEach((data) => {
      const copyData = data;
      copyData.referencedAt = date;
      // TODO not hardcode
      resData.push({ index: { _index: 'unpaywall_enriched', _id: data.doi } });
      resData.push(copyData);
    });
    return true;
  }

  const oldUnpaywallDataMap = new Map(
    oldData.map((data) => {
      const copyData = { ...data };
      return [data.doi, copyData];
    }),
  );

  newData.forEach((data) => {
    const copyData = data;
    copyData.referencedAt = date;
    // history insertion
    const oldDataUnpaywall = oldUnpaywallDataMap.get(data.doi);

    if (oldDataUnpaywall) {
      const newEntry = {
        ...oldDataUnpaywall,
        date,
      };
      newEntry.endValidity = data.updated;

      // TODO not hardcode
      resHistoryData.push({ index: { _index: 'unpaywall_history' } });
      resHistoryData.push(newEntry);

      // if data, get the old referencedAt
      copyData.referencedAt = oldDataUnpaywall.referencedAt;
    }

    // TODO not hardcode
    resData.push({ index: { _index: 'unpaywall_enriched', _id: data.doi } });
    resData.push(copyData);
  });

  // TODO not hardcode
  await insertUnpaywallDataInElastic(resData, 'unpaywall_enriched');

  if (resHistoryData.length > 0) {
    // TODO not hardcode
    await insertUnpaywallDataInElastic(resHistoryData, 'unpaywall_history');
  }

  return true;
}

/**
 * Inserts the contents of an unpaywall data update file with history.
 *
 * @param {Object} insertConfig - Config of insertion.
 * @param {string} insertConfig.filename - Name of the snapshot file from which the data will
 * be retrieved to be inserted into elastic.
 * @param {string} insertConfig.date - Date of file.
 * @param {string} insertConfig.index - Name of the index to which the data will be inserted.
 * @param {number} insertConfig.offset - Line of the snapshot at which the data insertion starts.
 * @param {number} insertConfig.limit - Line in the file where the insertion stops.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertHistoryDataUnpaywall(insertConfig) {
  const {
    filename, date, index, offset, limit,
  } = insertConfig;

  try {
    // TODO not hardcode index
    await createIndex('unpaywall_enriched', unpaywallEnrichedMapping);
  } catch (err) {
    logger.error(`[elastic] Cannot create index [${index}]`, err);
    await fail(err);
    return false;
  }

  try {
    // TODO not hardcode index
    await createIndex('unpaywall_history', unpaywallHistoryMapping);
  } catch (err) {
    logger.error(`[elastic] Cannot create index [${index}]`, err);
    await fail(err);
    return false;
  }

  // step insertion in the state
  const start = new Date();
  addStepInsert(filename);
  const step = getLatestStep();
  step.file = filename;
  step.index = {
    // TODO not hardcode
    unpaywall_enriched: {
      insertedDocs: 0,
      updatedDocs: 0,
      failedDocs: 0,
    },
    unpaywall_history: {
      insertedDocs: 0,
      updatedDocs: 0,
      failedDocs: 0,
    },
  };
  updateLatestStep(step);

  const filePath = path.resolve(snapshotsDir, filename);

  // get information bytes for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`[job: insert] Cannot get bytes [${filePath}]`, err);
    await fail(err);
    return false;
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.error(`[job: insert] Cannot read [${filePath}]`, err);
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
    logger.error(`[job: insert] Cannot pipe [${readStream?.filename}]`, err);
    await fail(err);
    return false;
  }

  const rl = readline.createInterface({
    input: decompressedStream,
    crlfDelay: Infinity,
  });

  let newData = [];
  let listOfDoi = [];

  let success;

  logger.info(`[job: insert] Start insert with [${filename}]`);

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
        // [history]
        listOfDoi.push(doc.doi);
        newData.push(doc);
      } catch (err) {
        logger.error(`[job: insert] Cannot parse [${line}] in json format`, err);
        await fail(err);
        return false;
      }
    }
    // bulk insertion
    if (newData.length >= maxBulkSize) {
      success = await insertData(listOfDoi, newData, date);
      listOfDoi = [];
      newData = [];

      if (!success) return false;
      step.percent = ((loaded / bytes.size) * 100).toFixed(2);
      step.took = (new Date() - start) / 1000;
      updateLatestStep(step);
    }
    if (step.linesRead % 100000 === 0) {
      logger.info(`[job: insert] ${step.linesRead} Lines reads`);
      updateLatestStep(step);
    }
  }
  // last insertion if there is data left
  if (newData.length > 0) {
    // [history]
    success = await insertData(listOfDoi, newData, date);
    listOfDoi = [];
    newData = [];
    if (!success) return false;
  }

  logger.info('[job: insert] insertion completed');

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

async function step1(startDate) {
  logger.debug('----------------------------------');
  logger.debug('STEP 1');
  logger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  logger.debug(`Should DELETE greater or equal than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  const toRecentDataInHistoryBulk = [];
  const toRecentDataInHistory = await searchWithRange(startDate, 'updated', 'gte', 'unpaywall_history');

  toRecentDataInHistory.forEach((data) => {
    toRecentDataInHistoryBulk.push({ delete: { _index: 'unpaywall_history', _id: data._id } });
    logger.debug(`HISTORY: DELETE: doi: ${data._source.doi}, genre: ${data._source.genre}, updated: ${data._source.updated}`);
  });

  await bulk(toRecentDataInHistoryBulk, true);
  logger.debug(`DELETE ${toRecentDataInHistoryBulk.length} lines`);
  logger.debug('UNPAYWALL: REFRESH');
  await refreshIndex('unpaywall_enriched');
}

async function step2(startDate) {
  logger.debug('----------------------------------');
  logger.debug('STEP 2');
  logger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  logger.debug(`Should UPDATE data less than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  const nearestDataBulk = [];
  const nearestDataDeleteBulk = [];
  const oldData = await searchWithRange(startDate, 'updated', 'lt', 'unpaywall_history');

  const listOfDoi = oldData.map((e) => e._source.doi);
  const listOfDoiFiltered = new Set(listOfDoi);

  for (const doi of listOfDoiFiltered) {
    const docs = oldData.filter((e) => doi === e._source.doi);
    let nearestData;
    docs.forEach((doc) => {
      if (!nearestData) {
        nearestData = doc;
      }
      const date1 = new Date(startDate) - new Date(doc._source.updated);
      const date2 = new Date(startDate) - new Date(nearestData._source.updated);

      if (date1 < date2) {
        nearestData = doc;
      }
    });

    const oldDoc = await getDataByListOfDOI([nearestData._source.doi], 'unpaywall_enriched');
    logger.info(`oldData: ${format(new Date(oldDoc[0].updated), 'yyyy-MM-dd/hh:mm:ss')} < startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);

    if (new Date(startDate) < new Date(oldDoc[0].updated)) {
      // UPDATE
      delete nearestData._source.endValidity;
      nearestDataBulk.push({ index: { _index: 'unpaywall_enriched', _id: nearestData._source.doi } });
      nearestDataBulk.push(nearestData._source);
      logger.debug(`UNPAYWALL: UPDATE: doi: ${nearestData._source.doi}, genre: ${nearestData._source.genre}, updated: ${nearestData._source.updated}`);

      // DELETE
      nearestDataDeleteBulk.push({ delete: { _index: 'unpaywall_history', _id: nearestData._id } });
      logger.debug(`HISTORY: DELETE: doi: ${nearestData._source.doi}, genre: ${nearestData._source.genre}, updated: ${nearestData._source.updated}`);
    }
  }

  // UPDATE
  await bulk(nearestDataBulk, true);
  logger.debug(`UPDATE ${nearestDataBulk.length / 2} lines`);
  logger.debug('UNPAYWALL: REFRESH');
  await refreshIndex('unpaywall_enriched');

  // DELETE
  await bulk(nearestDataDeleteBulk, true);
  logger.debug(`DELETE ${nearestDataDeleteBulk.length} lines`);
  logger.debug('HISTORY: REFRESH');
  await refreshIndex('unpaywall_history');
}

async function step3(startDate) {
  logger.debug('----------------------------------');
  logger.debug('STEP 3');

  const toRecentDataBulk = [];
  const toRecentData = await searchWithRange(startDate, 'updated', 'gte', 'unpaywall_enriched');
  logger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  logger.debug(`Should DELETE data greater or equal than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  toRecentData.forEach((data) => {
    toRecentDataBulk.push({ delete: { _index: 'unpaywall_enriched', _id: data._id } });
    logger.debug(`UNPAYWALL: DELETE: doi: ${data._source.doi}, genre: ${data._source.genre}, updated: ${format(new Date(data._source.updated), 'yyyy-MM-dd/hh:mm:ss')}`);
  });

  await bulk(toRecentDataBulk, true);
  logger.debug(`DELETE ${toRecentDataBulk.length} lines`);
  logger.debug('UNPAYWALL: REFRESH');
  await refreshIndex('unpaywall_enriched');
}

/**
 * Resets the unpaywall index according to a date and deletes the data in the history.
 * @param {string} startDate - The date you wish to return to
 */
async function rollBack(startDate) {
  logger.debug('================================');
  await step1(startDate);
  await step2(startDate);
  await step3(startDate);
}

module.exports = {
  insertHistoryDataUnpaywall,
  rollBack,
  step1,
  step2,
  step3,
};