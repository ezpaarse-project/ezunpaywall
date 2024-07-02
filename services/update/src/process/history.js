/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const config = require('config');
const zlib = require('zlib');
const { format } = require('date-fns');
const { paths } = require('config');

const logger = require('../logger/appLogger');
const unpaywallEnrichedMapping = require('../../mapping/unpaywall.json');
const unpaywallHistoryMapping = require('../../mapping/unpaywall-history.json');

const {
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
} = require('../lib/state');

const {
  refreshIndex,
  searchByDOI,
  bulk,
  createIndex,
  searchWithRange,
} = require('../services/elastic');

const maxBulkSize = config.get('elasticsearch.maxBulkSize');

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
    logger.error(`[elastic]: Cannot bulk on index [${index}]`, err);
    await fail(err?.[0]?.reason);
    return false;
  }

  const errors = [];
  const items = Array.isArray(res?.body?.items) ? res?.body?.items : [];

  items.forEach((i) => {
    if (i?.index?.result === 'created') {
      step.indices[index].addedDocs += 1;
      return;
    }
    if (i?.index?.result === 'updated') {
      step.indices[index].updatedDocs += 1;
      return;
    }

    if (i?.index?.error !== undefined) {
      step.indices[index].failedDocs += 1;
      errors.push(i?.index?.error);
    }
  });

  if (errors.length > 0) {
    logger.error('[elastic]: Error in bulk insertion');
    errors.forEach((error) => {
      logger.error(`[elastic]: ${JSON.stringify(error, null, 2)}`);
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
 * Insert data in unpaywall index base and history index.
 * that insert normally in the index base and for the history, if doi is present in
 * index base, that will create a new entry on history index.
 *
 * @param {Array<string>} listOfDoi - Array of DOI that will be inserted
 * @param {Array<Object>} newDocuments - Array of document that will be inserted
 * @param {string} indexBase - name of base index
 * @param {string} indexHistory - name of history base
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertData(listOfDoi, newDocuments, indexBase, indexHistory) {
  logger.debug(`[job][insert]: try to get [${listOfDoi.length}] documents in [${indexBase}]`);
  const existingDataInBaseIndex = await searchByDOI(listOfDoi, indexBase);
  logger.debug(`[job][insert]: get [${existingDataInBaseIndex.length}] documents in [${indexBase}]`);
  const bulkHistoryDocuments = [];
  const bulkDocuments = [];

  const existingUnpaywallDataMap = new Map(
    existingDataInBaseIndex.map((data) => {
      const copyData = { ...data };
      return [data.doi, copyData];
    }),
  );

  newDocuments.forEach(async (el) => {
    const document = el;
    document.referencedAt = document.updated;
    const existingDocumentUnpaywall = existingUnpaywallDataMap.get(document.doi);

    if (existingDocumentUnpaywall) {
      const copyDocumentTime = new Date(document.updated).getTime();
      const existingDocumentTime = new Date(existingDocumentUnpaywall.updated).getTime();
      // if the document in changefile is older than the existence, don't insert it
      if (copyDocumentTime > existingDocumentTime) {
        const newEntryInHistory = existingDocumentUnpaywall;
        newEntryInHistory.endValidity = document.updated;

        bulkHistoryDocuments.push({ index: { _index: indexHistory, _id: `${document.updated}-${document.doi}` } });
        bulkHistoryDocuments.push(newEntryInHistory);

        // get the existing referencedAt to apply it for the new entry in history
        document.referencedAt = existingDocumentUnpaywall.referencedAt;
      }
      if (copyDocumentTime === existingDocumentTime) {
        document.referencedAt = existingDocumentUnpaywall.referencedAt;
      }
    } else {
      // If new data, add referencedAt to new data
      document.referencedAt = document.updated;
    }

    bulkDocuments.push({ index: { _index: indexBase, _id: document.doi } });
    bulkDocuments.push(document);
  });

  let success = false;

  logger.debug(`[job][insert]: try to insert [${bulkDocuments.length / 2}] documents in [${indexBase}]`);
  success = await insertUnpaywallDataInElastic(bulkDocuments, indexBase);
  if (!success) return false;

  if (bulkHistoryDocuments.length > 0) {
    logger.debug(`[job][insert]: try to insert [${bulkHistoryDocuments.length / 2}] documents in [${indexHistory}]`);
    success = await insertUnpaywallDataInElastic(bulkHistoryDocuments, indexHistory);
    if (!success) return false;
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
    filename, indexBase, indexHistory, offset, limit,
  } = insertConfig;

  try {
    await createIndex(indexBase, unpaywallEnrichedMapping);
  } catch (err) {
    logger.error(`[elastic]: Cannot create index [${indexBase}]`, err);
    await fail(err);
    return false;
  }

  try {
    await createIndex(indexHistory, unpaywallHistoryMapping);
  } catch (err) {
    logger.error(`[elastic]: Cannot create index [${indexHistory}]`, err);
    await fail(err);
    return false;
  }

  // step insertion in the state
  const start = new Date();
  addStepInsert(filename);
  const step = getLatestStep();
  step.file = filename;
  step.indices = {
    [indexBase]: {
      addedDocs: 0,
      updatedDocs: 0,
      failedDocs: 0,
    },
    [indexHistory]: {
      addedDocs: 0,
      updatedDocs: 0,
      failedDocs: 0,
    },
  };
  updateLatestStep(step);

  const filePath = path.resolve(paths.data.changefilesDir, filename);

  // get information bytes for state
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

  let newData = [];
  let listOfDoi = [];

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
        // history
        listOfDoi.push(doc.doi);
        newData.push(doc);
      } catch (err) {
        logger.error(`[job][insert]: Cannot parse [${line}] in json format`, err);
        await fail(err);
        return false;
      }
    }
    // bulk insertion
    if (newData.length >= maxBulkSize) {
      success = await insertData(listOfDoi, newData, indexBase, indexHistory);
      listOfDoi = [];
      newData = [];

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
  if (newData.length > 0) {
    // history
    success = await insertData(listOfDoi, newData, indexBase, indexHistory);
    listOfDoi = [];
    newData = [];
    if (!success) return false;
  }

  logger.info('[job][insert]: insertion completed');

  try {
    await refreshIndex();
  } catch (err) {
    logger.warn('[elastic]: Cannot refresh the index', err);
  }

  // last update of step
  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  step.percent = 100;
  updateLatestStep(step);
  return true;
}

async function step1(startDate, indexBase, indexHistory) {
  logger.debug('----------------------------------');
  logger.debug('STEP 1');
  logger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  logger.debug(`Should DELETE greater or equal than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  const toRecentDataInHistoryBulk = [];
  const toRecentDataInHistory = await searchWithRange(startDate, 'updated', 'gte', indexHistory);

  toRecentDataInHistory.forEach((data) => {
    toRecentDataInHistoryBulk.push({ delete: { _index: indexHistory, _id: data._id } });
    logger.debug(`HISTORY: DELETE: doi: ${data._source.doi}, genre: ${data._source.genre}, updated: ${data._source.updated}`);
  });

  await bulk(toRecentDataInHistoryBulk, true);
  logger.debug(`DELETE ${toRecentDataInHistoryBulk.length} lines`);
  logger.debug('UNPAYWALL: REFRESH');
  await refreshIndex(indexBase);
}

async function step2(startDate, indexBase, indexHistory) {
  logger.debug('----------------------------------');
  logger.debug('STEP 2');
  logger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  logger.debug(`Should UPDATE data less than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  const nearestDataBulk = [];
  const nearestDataDeleteBulk = [];
  logger.debug('searchWithRange');
  const oldData = await searchWithRange(startDate, 'updated', 'lt', indexHistory);
  logger.debug(`oldDoc.length: ${oldData?.length}`);

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

    logger.debug('step2');
    const oldDoc = await searchByDOI([nearestData._source.doi], indexBase);
    logger.debug(`oldDoc.length:  ${oldDoc.length}`);

    logger.info(`oldData: ${format(new Date(oldDoc[0].updated), 'yyyy-MM-dd/hh:mm:ss')} < startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);

    if (new Date(startDate) < new Date(oldDoc[0].updated)) {
      // UPDATE
      delete nearestData._source.endValidity;
      nearestDataBulk.push({ index: { _index: indexBase, _id: nearestData._source.doi } });
      nearestDataBulk.push(nearestData._source);
      logger.debug(`UNPAYWALL: UPDATE: doi: ${nearestData._source.doi}, genre: ${nearestData._source.genre}, updated: ${nearestData._source.updated}`);

      // DELETE
      nearestDataDeleteBulk.push({ delete: { _index: indexHistory, _id: nearestData._id } });
      logger.debug(`HISTORY: DELETE: doi: ${nearestData._source.doi}, genre: ${nearestData._source.genre}, updated: ${nearestData._source.updated}`);
    }
  }

  // UPDATE
  await bulk(nearestDataBulk, true);
  logger.debug(`UPDATE ${nearestDataBulk.length / 2} lines`);
  logger.debug('UNPAYWALL: REFRESH');
  await refreshIndex(indexBase);

  // DELETE
  await bulk(nearestDataDeleteBulk, true);
  logger.debug(`DELETE ${nearestDataDeleteBulk.length} lines`);
  logger.debug('HISTORY: REFRESH');
  await refreshIndex(indexHistory);
}

async function step3(startDate, indexBase) {
  logger.debug('----------------------------------');
  logger.debug('STEP 3');

  const toRecentDataBulk = [];
  const toRecentData = await searchWithRange(startDate, 'updated', 'gte', indexBase);
  logger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  logger.debug(`Should DELETE data greater or equal than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  toRecentData.forEach((data) => {
    toRecentDataBulk.push({ delete: { _index: indexBase, _id: data._id } });
    logger.debug(`UNPAYWALL: DELETE: doi: ${data._source.doi}, genre: ${data._source.genre}, updated: ${format(new Date(data._source.updated), 'yyyy-MM-dd/hh:mm:ss')}`);
  });

  await bulk(toRecentDataBulk, true);
  logger.debug(`DELETE ${toRecentDataBulk.length} lines`);
  logger.debug('UNPAYWALL: REFRESH');
  await refreshIndex(indexBase);
}

/**
 * Resets the unpaywall index according to a date and deletes the data in the history.
 * @param {string} startDate - The date you wish to return to
 */
async function rollBack(startDate, indexBase, indexHistory) {
  await step1(startDate, indexBase, indexHistory);
  await step2(startDate, indexBase, indexHistory);
  await step3(startDate, indexBase);
}

module.exports = {
  insertHistoryDataUnpaywall,
  rollBack,
  step1,
  step2,
  step3,
};
