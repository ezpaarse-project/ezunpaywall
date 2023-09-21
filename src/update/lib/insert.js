/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */

const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const config = require('config');
const zlib = require('zlib');

const logger = require('./logger');
const unpaywallEnrichedMapping = require('../mapping/unpaywall.json');
const unpaywallHistoryMapping = require('../mapping/unpaywall_history.json');

const {
  addStepInsert,
  getLatestStep,
  updateLatestStep,
  fail,
} = require('./models/state');

const {
  refreshIndex,
  bulk,
  initAlias,
  createIndex,
  getDataByListOfDOI,
} = require('./services/elastic');

const indexAlias = config.get('elasticsearch.indexAlias');
const maxBulkSize = config.get('elasticsearch.maxBulkSize');

const snapshotsDir = path.resolve(__dirname, '..', 'data', 'snapshots');

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

  await initAlias(index, unpaywallEnrichedMapping, indexAlias);

  const filePath = path.resolve(snapshotsDir, filename);

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`[job: insert] Cannot stat [${filePath}]`, err);
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

  // array that will contain the packet of 1000 unpaywall data
  let bulkOps = [];

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
        bulkOps.push({ index: { _index: index, _id: doc.doi } });
        bulkOps.push(doc);
      } catch (err) {
        logger.error(`[job: insert] Cannot parse [${line}] in json format`, err);
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
      logger.info(`[job: insert] ${step.linesRead} Lines reads`);
      updateLatestStep(step);
    }
  }
  // last insertion if there is data left
  if (bulkOps.length > 0) {
    success = await insertUnpaywallDataInElastic(bulkOps, step);
    bulkOps = [];
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

/**
  * Gets difference between 2 objects
  *
  * @param v1 First object to compare
  * @param v2 Second object to compare
  * @param prefix Prefix of returned keys. Should be empty on the first iteration
  *
  * @returns Keys that are in v1 but not in v2
  */
function objectDiff(v1, v2, prefix = '') {
  const diffs = Object.keys(v1 ?? {}).reduce(
    (previous, key) => {
      const prefixedKey = `${prefix}${key}`;
      if (typeof v1[key] === 'object') {
        return [
          ...previous,
          ...objectDiff(v1[key], v2[key], `${prefixedKey}.`),
        ];
      }
      if (v1[key] !== v2[key]) {
        return [
          ...previous,
          prefixedKey,
        ];
      }
      return previous;
    },
    [],
  );
  return diffs;
  // const diffs = Object.keys(v1 ?? {}).reduce(
  //   (d, key) => {
  //     const prefixedKey = `${prefix}${key}`;
  //     if (
  //       Array.isArray(v2[key])
  //         ? !v2[key].map((v) => typeof v).includes(typeof v1[key])
  //         : typeof v1[key] !== typeof v2[key]
  //     ) {
  //       d.push(prefixedKey);
  //     } else if (typeof v1[key] === 'object' && !Array.isArray(v1[key])) {
  //       d.push(
  //         ...objectDiff(
  //           v1[key],
  //           v2[key],
  //           `${prefixedKey}.`,
  //         ),
  //       );
  //     }
  //     return d;
  //   },
  //   [],
  // );
  // return diffs;
}

/**
 * 1. Insert unpaywall data in elastic with history
 * 2. Insert history data in elastic
 *
 * @param {Array<string>} listOfDoi - List of DOI
 * @param {Array<Object>} newData - List of unpaywall data
 * @param {Date} date - Date of file
 */
async function insertData(listOfDoi, newData, date) {
  // TODO date of file
  date = new Date();

  const oldData = await getDataByListOfDOI(listOfDoi, 'unpaywall');
  const historyData = await getDataByListOfDOI(listOfDoi, 'unpaywall_history');

  let oldHistoryDataMap;
  let oldUnpaywallDataMap;
  const resHistoryData = [];

  if (historyData.length > 0) {
    oldHistoryDataMap = new Map(
      historyData.map((data) => {
        const copyData = { ...data };
        return [data.doi, copyData];
      }),
    );

    oldUnpaywallDataMap = new Map(
      oldData.map((data) => {
        const copyData = { ...data };
        return [data.doi, copyData];
      }),
    );
    // enrich history
    newData.forEach((data) => {
      const oldDataUnpaywall = oldUnpaywallDataMap.get(data.doi);
      // if document already exist
      if (oldDataUnpaywall) {
        const diffs = objectDiff(data, oldDataUnpaywall);
        if (diffs.length > 0) {
          const enrichedHistoryData = oldHistoryDataMap.get(data.doi);
          // If document hasn't got history
          if (!enrichedHistoryData) {
            resHistoryData.push({ index: { _index: 'unpaywall_history', _id: data.doi } });
            resHistoryData.push({
              doi: data.doi,
              referencedAt: date,
              history: [],
            });
          } else {
            const newEntryHistory = {};
            newEntryHistory.date = new Date();

            diffs.forEach((diff) => {
              newEntryHistory[diff] = oldDataUnpaywall[diff];
            });

            enrichedHistoryData.history.push(newEntryHistory);

            resHistoryData.push({ index: { _index: 'unpaywall_history', _id: data.doi } });
            resHistoryData.push(enrichedHistoryData);
          }
        }
      }
    });
  } else {
    // First insertion
    newData.forEach((data) => {
      const newEntry = {
        doi: data.doi,
        referencedAt: date,
        history: [],
      };
      resHistoryData.push({ index: { _index: 'unpaywall_history', _id: newEntry.doi } });
      resHistoryData.push(newEntry);
    });
  }

  if (resHistoryData.length > 0) {
    try {
      await bulk(resHistoryData, 'unpaywall_history');
    } catch (err) {
      logger.error(err);
    }
  }

  const bulkOps = [];

  newData.forEach((data) => {
    bulkOps.push({ index: { _index: 'unpaywall', _id: data.doi } });
    bulkOps.push(data);
  });

  try {
    await bulk(bulkOps, 'unpaywall');
  } catch (err) {
    logger.error(err);
  }

  // #endregion 2
  return true;
}

/**
 * Inserts the contents of an unpaywall data update file with oa history.
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
async function insertHistoryDataUnpaywall(insertConfig) {
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

  await createIndex('unpaywall', unpaywallEnrichedMapping);
  await createIndex('unpaywall_history', unpaywallHistoryMapping);

  await initAlias(index, unpaywallEnrichedMapping, indexAlias);

  const filePath = path.resolve(snapshotsDir, filename);

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`[job: insert] Cannot stat [${filePath}]`, err);
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

  // array that will contain the packet of 1000 unpaywall data
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
      success = await insertData(listOfDoi, newData);
      if (!success) return false;
      listOfDoi = [];
      newData = [];
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
    success = await insertData(listOfDoi, newData);
    if (!success) return false;
    listOfDoi = [];
    newData = [];
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

module.exports = {
  insertDataUnpaywall,
  insertHistoryDataUnpaywall,
};
