/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs');
const fsp = require('fs/promises');
const readline = require('readline');
const { elasticsearch } = require('config');
const zlib = require('zlib');
const { format } = require('date-fns');
const { paths } = require('config');

const appLogger = require('../logger/appLogger');

const unpaywallEnrichedMapping = require('../../../mapping/unpaywall.json');
const unpaywallHistoryMapping = require('../../../mapping/unpaywall-history.json');

const {
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
} = require('./state');

const {
  refreshIndex,
  searchByDOI,
  bulk,
  createIndex,
  searchWithRange,
} = require('../elastic');

const { maxBulkSize } = elasticsearch;

/**
 * Insert data on elastic with elastic bulk request.
 *
 * @param {Array<Object>} dataArray of unpaywall data.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertUnpaywallDataInElastic(data, index) {
  const step = getLatestStep();
  let res;
  try {
    res = await bulk(data);
  } catch (err) {
    appLogger.error(`[history][insert][elastic]: Cannot bulk on index [${index}]`, err);
    throw err;
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
    appLogger.error('[history][insert][elastic]: Error in bulk insertion');
    errors.forEach((error) => {
      appLogger.error(`[history][insert][elastic]: ${JSON.stringify(error, null, 2)}`);
    });
    step.status = 'error';
    updateLatestStep(step);
    throw errors;
  }

  updateLatestStep(step);
}
/**
 * Insert data in unpaywall index base and history index.
 * that insert normally in the index base and for the history, if doi is present in
 * index base, that will create a new entry on history index.
 *
 * @param {Array<string>} dois Array of DOI that will be inserted
 * @param {Array<Object>} newDois Array of document that will be inserted
 * @param {string} index Name of base index
 * @param {string} indexHistory Name of history base
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertData(dois, newDois, index, indexHistory) {
  appLogger.debug(`[job][insert][history]: try to get [${dois.length}] documents in [${index}]`);
  const existingDataInBaseIndex = await searchByDOI(dois, index);
  appLogger.debug(`[job][insert][history]: get [${existingDataInBaseIndex.length}] documents in [${index}]`);
  const bulkHistoryDocuments = [];
  const bulkDocuments = [];

  const existingUnpaywallDataMap = new Map(
    existingDataInBaseIndex.map((data) => {
      const copyData = { ...data };
      return [data.doi, copyData];
    }),
  );

  newDois.forEach(async (el) => {
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

    bulkDocuments.push({ index: { _index: index, _id: document.doi } });
    bulkDocuments.push(document);
  });

  appLogger.debug(`[job][insert][history]: try to insert [${bulkDocuments.length / 2}] documents in [${index}]`);
  try {
    insertUnpaywallDataInElastic(bulkDocuments, index);
  } catch (err) {
    appLogger.error('[job][insert][history]: Error in bulk insertion');
    throw err;
  }
  if (bulkHistoryDocuments.length > 0) {
    appLogger.debug(`[job][insert][history]: try to insert [${bulkHistoryDocuments.length / 2}] documents in [${indexHistory}]`);
    try {
      insertUnpaywallDataInElastic(bulkHistoryDocuments, indexHistory);
    } catch (err) {
      appLogger.error('[job][insert][history]: Error in bulk insertion');
      throw err;
    }
  }

  return true;
}

/**
 * Inserts the contents of an unpaywall data update file with history.
 *
 * @param {Object} insertConfigConfig of insertion.
 * @param {string} insertConfig.filenameName of the snapshot file from which the data will
 * be retrieved to be inserted into elastic.
 * @param {string} insertConfig.dateDate of file.
 * @param {string} insertConfig.index of the index to which the data will be inserted.
 * @param {number} insertConfig.offsetLine of the snapshot at which the data insertion starts.
 * @param {number} insertConfig.limitLine in the file where the insertion stops.
 *
 * @returns {Promise<boolean>} Success or not.
 */
async function insertHistoryDataUnpaywall(insertConfig) {
  const {
    filename, index, indexHistory, offset, limit,
  } = insertConfig;

  try {
    await createIndex(index, unpaywallEnrichedMapping);
  } catch (err) {
    appLogger.error(`[insert][elastic]: Cannot create index [${index}]`, err);
    throw err;
  }

  try {
    await createIndex(indexHistory, unpaywallHistoryMapping);
  } catch (err) {
    appLogger.error(`[insert][elastic]: Cannot create index [${indexHistory}]`, err);
    throw err;
  }

  // step insertion in the state
  const start = new Date();
  addStepInsert(filename);
  const step = getLatestStep();
  step.file = filename;
  step.indices = {
    [index]: {
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
    bytes = await fsp.stat(filePath);
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot get bytes [${filePath}]`, err);
    throw err;
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    appLogger.error(`[job][insert]: Cannot read [${filePath}]`, err);
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
    throw err;
  }

  const rl = readline.createInterface({
    input: decompressedStream,
    crlfDelay: Infinity,
  });

  let newData = [];
  let dois = [];

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
        // history
        dois.push(doc.doi);
        newData.push(doc);
      } catch (err) {
        appLogger.error(`[job][insert]: Cannot parse [${line}] in json format`, err);
        throw err;
      }
    }
    // bulk insertion
    if (newData.length >= maxBulkSize) {
      success = await insertData(dois, newData, index, indexHistory);
      dois = [];
      newData = [];

      if (!success) return false;
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
  if (newData.length > 0) {
    // history
    success = await insertData(dois, newData, index, indexHistory);
    dois = [];
    newData = [];
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

async function step1(startDate, index, indexHistory) {
  appLogger.debug('----------------------------------');
  appLogger.debug('STEP 1');
  appLogger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  appLogger.debug(`Should DELETE greater or equal than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  const toRecentDataInHistoryBulk = [];
  const toRecentDataInHistory = await searchWithRange(startDate, 'updated', 'gte', indexHistory);

  toRecentDataInHistory.forEach((data) => {
    toRecentDataInHistoryBulk.push({ delete: { _index: indexHistory, _id: data._id } });
    appLogger.debug(`HISTORY: DELETE: doi: ${data._source.doi}, genre: ${data._source.genre}, updated: ${data._source.updated}`);
  });

  await bulk(toRecentDataInHistoryBulk, true);
  appLogger.debug(`DELETE ${toRecentDataInHistoryBulk.length} lines`);
  appLogger.debug('UNPAYWALL: REFRESH');
  await refreshIndex(index);
}

async function step2(startDate, index, indexHistory) {
  appLogger.debug('----------------------------------');
  appLogger.debug('STEP 2');
  appLogger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  appLogger.debug(`Should UPDATE data less than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  const nearestDataBulk = [];
  const nearestDataDeleteBulk = [];
  appLogger.debug('searchWithRange');
  const oldData = await searchWithRange(startDate, 'updated', 'lt', indexHistory);
  appLogger.debug(`oldDoc.length: ${oldData?.length}`);

  const dois = oldData.map((e) => e._source.doi);
  const doisFiltered = new Set(dois);

  for (const doi of doisFiltered) {
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

    appLogger.debug('step2');
    const oldDoc = await searchByDOI([nearestData._source.doi], index);
    appLogger.debug(`oldDoc.length:  ${oldDoc.length}`);

    appLogger.info(`oldData: ${format(new Date(oldDoc[0].updated), 'yyyy-MM-dd/hh:mm:ss')} < startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);

    if (new Date(startDate) < new Date(oldDoc[0].updated)) {
      // UPDATE
      delete nearestData._source.endValidity;
      nearestDataBulk.push({ index: { _index: index, _id: nearestData._source.doi } });
      nearestDataBulk.push(nearestData._source);
      appLogger.debug(`UNPAYWALL: UPDATE: doi: ${nearestData._source.doi}, genre: ${nearestData._source.genre}, updated: ${nearestData._source.updated}`);

      // DELETE
      nearestDataDeleteBulk.push({ delete: { _index: indexHistory, _id: nearestData._id } });
      appLogger.debug(`HISTORY: DELETE: doi: ${nearestData._source.doi}, genre: ${nearestData._source.genre}, updated: ${nearestData._source.updated}`);
    }
  }

  // UPDATE
  await bulk(nearestDataBulk, true);
  appLogger.debug(`UPDATE ${nearestDataBulk.length / 2} lines`);
  appLogger.debug('UNPAYWALL: REFRESH');
  await refreshIndex(index);

  // DELETE
  await bulk(nearestDataDeleteBulk, true);
  appLogger.debug(`DELETE ${nearestDataDeleteBulk.length} lines`);
  appLogger.debug('HISTORY: REFRESH');
  await refreshIndex(indexHistory);
}

async function step3(startDate, index) {
  appLogger.debug('----------------------------------');
  appLogger.debug('STEP 3');

  const toRecentDataBulk = [];
  const toRecentData = await searchWithRange(startDate, 'updated', 'gte', index);
  appLogger.debug(`startDate: ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  appLogger.debug(`Should DELETE data greater or equal than ${format(new Date(startDate), 'yyyy-MM-dd/hh:mm:ss')}`);
  toRecentData.forEach((data) => {
    toRecentDataBulk.push({ delete: { _index: index, _id: data._id } });
    appLogger.debug(`UNPAYWALL: DELETE: doi: ${data._source.doi}, genre: ${data._source.genre}, updated: ${format(new Date(data._source.updated), 'yyyy-MM-dd/hh:mm:ss')}`);
  });

  await bulk(toRecentDataBulk, true);
  appLogger.debug(`DELETE ${toRecentDataBulk.length} lines`);
  appLogger.debug('UNPAYWALL: REFRESH');
  await refreshIndex(index);
}

/**
 * Resets the unpaywall index according to a date and deletes the data in the history.
 *
 * @param {string} startDate The date you wish to return to
 */
async function rollBack(startDate, index, indexHistory) {
  await step1(startDate, index, indexHistory);
  await step2(startDate, index, indexHistory);
  await step3(startDate, index);
}

module.exports = {
  insertHistoryDataUnpaywall,
  rollBack,
  step1,
  step2,
  step3,
};
