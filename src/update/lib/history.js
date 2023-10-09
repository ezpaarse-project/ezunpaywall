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
  getDataByListOfDOI,
  bulk,
  createIndex,
  searchWithRange,
} = require('./services/elastic');

const maxBulkSize = config.get('elasticsearch.maxBulkSize');

const snapshotsDir = path.resolve(__dirname, '..', 'data', 'snapshots');

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
      // classic insertion
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

    // classic insertion
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

/**
 * Resets the unpaywall index according to a date and deletes the data in the history.
 * @param {string} startDate - The date you wish to return to
 */
async function rollBack(startDate) {
  // STEP 2
  const nearestDataBulk = [];
  const nearestDataDeleteBulk = [];
  const oldData = await searchWithRange(startDate, 'endValidity', 'lt', 'unpaywall_history');

  const listOfDoi = oldData.map((e) => e._source.doi);
  const listOfDoiFiltered = new Set(listOfDoi);

  for (const doi of listOfDoiFiltered) {
    console.log(doi);
    const docs = oldData.filter((e) => doi === e._source.doi);
    let nearestData;
    let nearestID;
    docs.forEach((doc) => {
      const unpaywallData = doc._source;
      if (!nearestData) {
        nearestID = doc._id;
        nearestData = unpaywallData;
      }
      const date1 = new Date(startDate) - new Date(unpaywallData.endValidity);
      const date2 = new Date(startDate) - new Date(nearestData.endValidity);

      if (date1 < date2) {
        nearestID = doc._id;
        nearestData = unpaywallData;
      }
    });

    const oldDoc = await getDataByListOfDOI([nearestData.doi], 'unpaywall_enriched');

    if (new Date(oldDoc[0].updated) >= new Date(startDate)) {
      nearestDataDeleteBulk.push({ delete: { _index: 'unpaywall_history', _id: nearestID } });
      nearestDataBulk.push({ index: { _index: 'unpaywall_enriched', _id: nearestData.doi } });
      nearestDataBulk.push(nearestData);
    }
  }

  // STEP 2
  // STEP 3
  await bulk(nearestDataBulk, true);
  await refreshIndex('unpaywall_enriched');
  console.log('Doc mit à jour dans l\'index courant', nearestDataBulk.length / 2);
  await bulk(nearestDataDeleteBulk, true);
  await refreshIndex('unpaywall_history');
  console.log('Doc supprimé dans l\'historique', nearestDataDeleteBulk.length);

  // STEP 4
  const toRecentDataBulk = [];
  const toRecentData = await searchWithRange(startDate, 'updated', 'gte', 'unpaywall_enriched');

  const listOfIDToRecentData = toRecentData.map((e) => e._id);

  listOfIDToRecentData.forEach((id) => {
    toRecentDataBulk.push({ delete: { _index: 'unpaywall_enriched', _id: id } });
  });

  await bulk(toRecentDataBulk, true);
  await refreshIndex('unpaywall_enriched');

  // STEP 1
  const toRecentDataInHistoryBulk = [];
  const toRecentDataInHistory = await searchWithRange(startDate, 'endValidity', 'gte', 'unpaywall_history');

  toRecentDataInHistory.forEach((e) => {
    console.log(e._source.updated);
  });

  const listOfIDToRecentDataInHistory = toRecentDataInHistory.map((e) => e._id);

  listOfIDToRecentDataInHistory.forEach((id) => {
    toRecentDataInHistoryBulk.push({ delete: { _index: 'unpaywall_history', _id: id } });
  });

  await bulk(toRecentDataInHistoryBulk, true);
  console.log('valeur trop recente', toRecentDataInHistoryBulk.length);
  await refreshIndex('unpaywall_enriched');
}

// /**
//  * Resets the unpaywall index according to a date and deletes the data in the history.
//  * @param {string} startDate - The date you wish to return to
//  */
// async function rollBack(startDate) {
//   const bulkUpdate = [];
//   const bulkDelete = [];
//   const bulkHistoryDelete = [];
//   const bulkHistoryDelete2 = [];

//   let data = await searchWithRange(startDate, 'endValidity', 'lte', 'unpaywall_history');
//   logger.debug(`unpaywall_history.length: ${data.length}`);
//   logger.info(format(startDate, 'yyyy-MM-dd-HH'));

//   const listOfDoi = data.map((e) => e._source.doi);
//   const listOfDoiFiltered = new Set(listOfDoi);

//   for (const doi of listOfDoiFiltered) {
//     const doc = data.filter((e) => doi === e._source.doi);
//     let latestDoc;
//     doc.forEach((e) => {
//       const unpaywallData = e._source;
//       if (!latestDoc) {
//         latestDoc = unpaywallData;
//       }
//       const date1 = new Date(startDate) - new Date(unpaywallData.endValidity);
//       const date2 = new Date(startDate) - new Date(latestDoc.endValidity);

//       if (date1 < date2) {
//         latestDoc = unpaywallData;
//       }
//     });

//     const tt = await getDataByListOfDOI([latestDoc.doi], 'unpaywall_enriched');

//     logger.debug(`oldData : ${new Date(tt[0].updated)}`);
//     logger.debug(`Request : ${new Date(startDate)}`);
//     logger.debug(`doi : ${doi}`);
//     if (new Date(tt[0].updated) >= new Date(startDate)) {
//       bulkUpdate.push({ index: { _index: 'unpaywall_enriched', _id: latestDoc.doi } });
//       bulkUpdate.push(latestDoc);
//     }
//     logger.debug('$$$$$$$$$$$$$$$');
//     logger.debug(latestDoc.genre);
//   }

//   logger.debug(`[unpaywall] update : ${bulkUpdate.length / 2}`);

//   // UPDATE in unpaywall index
//   try {
//     await bulk(bulkUpdate, true);
//   } catch (err) {
//     logger.error('[elastic] Cannot bulk', err);
//     return false;
//   }

//   if (bulkUpdate.length > 0) {
//     const dataThatWillBeDeleted =
// await searchWithRange(startDate, 'endValidity', 'gte', 'unpaywall_history');

//     const listOfID = dataThatWillBeDeleted.map((e) => e._id);

//     listOfID.forEach((id) => {
//       bulkHistoryDelete.push({ delete: { _index: 'unpaywall_history', _id: id } });
//     });
//   }

//   logger.debug(`[unpaywall_history] delete: ${bulkHistoryDelete.length}`);

//   // DELETE in history index
//   try {
//     await bulk(bulkHistoryDelete, true);
//   } catch (err) {
//     logger.error('[elastic] Cannot bulk', err);
//     return false;
//   }

//   data = await searchWithRange(startDate, 'updated', 'gt', 'unpaywall_enriched');

//   data.forEach((e) => {
//     bulkDelete.push({ delete: { _index: 'unpaywall_enriched', _id: e._source.doi } });
//   });

//   logger.debug(`[unpaywall] delete: ${bulkDelete.length}`);

//   // DELETE in unpaywall index
//   try {
//     await bulk(bulkDelete, true);
//   } catch (err) {
//     logger.error('[elastic] Cannot bulk', err);
//     return false;
//   }

//   logger.debug(`[unpaywall_history] delete: ${bulkHistoryDelete.length}`);

//   data = await searchWithRange(startDate, 'updated', 'gt', 'unpaywall_history');
//   data.forEach((e) => {
//     bulkHistoryDelete2.push({ delete: { _index: 'unpaywall_history', _id: e._id } });
//   });

//   logger.debug(`[unpaywall_history] second delete: ${bulkHistoryDelete2.length}`);

//   // DELETE in unpaywall history index
//   try {
//     await bulk(bulkHistoryDelete2, true);
//   } catch (err) {
//     logger.error('[elastic] Cannot bulk', err);
//     return false;
//   }
// }

module.exports = {
  insertHistoryDataUnpaywall,
  rollBack,
};
