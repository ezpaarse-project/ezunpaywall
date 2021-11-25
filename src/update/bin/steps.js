/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable no-restricted-syntax */
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const zlib = require('zlib');
const { Readable } = require('stream');
const axios = require('axios');
const config = require('config');

const {
  elasticClient,
  createIndex,
} = require('../lib/elastic');

const logger = require('../lib/logger');

const snapshotsDir = path.resolve(__dirname, '..', 'out', 'snapshots');

const unpaywallMapping = require('../mapping/unpaywall.json');

const maxBulkSize = config.get('elasticsearch.maxBulkSize');
const indexAlias = config.get('elasticsearch.indexAlias');

const {
  getState,
  updateStateInFile,
  addStepAskUnpaywall,
  addStepDownload,
  addStepInsert,
  fail,
} = require('./state');

/**
 * insert data on elastic with request
 * @param {Array} data array of unpaywall data
 * @param {String} stateName - state filename
 */
const insertDataInElastic = async (data, stateName, step) => {
  let res;
  try {
    res = await elasticClient.bulk({ body: data });
  } catch (err) {
    logger.error('Cannot bulk on elastic');
    logger.error(err);
    await fail(stateName, 'Cannot bulk on elastic');
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
      errors.push(i?.index?.error);
    }

    step.failedDocs += 1;
  });

  if (errors.length > 0) {
    logger.error(JSON.stringify(errors, null, 2));
    await fail(stateName, errors);
    return false;
  }

  return true;
};

/**
 * Inserts the contents of an unpaywall data update file
 * @param {String} stateName - state filename
 * @param {String} index name of the index to which the data will be saved
 * @param {String} filename - snapshot filename which the data will be inserted
 * @param {Integer} offset - offset
 * @param {Integer} limit - limit
 */
const insertDataUnpaywall = async (jobConfig) => {
  const { stateName } = jobConfig;
  const { index } = jobConfig;
  const { filename } = jobConfig;
  const { offset } = jobConfig;
  const { limit } = jobConfig;

  try {
    await createIndex(index, unpaywallMapping);
  } catch (err) {
    logger.error(`Cannot create index [${index}]`);
    logger.error(err);
    await fail(stateName, err);
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
    await fail(stateName, err);
    return false;
  }

  // step insertion in the state
  const start = new Date();
  await addStepInsert(stateName, filename);
  let state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  step.index = index;

  const filePath = path.resolve(snapshotsDir, filename);

  // get information "bytes" for state
  let bytes;
  try {
    bytes = await fs.stat(filePath);
  } catch (err) {
    logger.error(`Cannot stat ${filePath}`);
    logger.error(err);
    await fail(stateName, err);
    return false;
  }

  // read file with stream
  let readStream;
  try {
    readStream = fs.createReadStream(filePath);
  } catch (err) {
    logger.error(`Cannot read ${filePath}`);
    logger.error(err);
    await fail(stateName, err);
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
    await fail(stateName, err);
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
        await fail(stateName, err);
        return false;
      }
    }
    // bulk insertion
    if (bulkOps.length >= maxBulkSize) {
      const dataToInsert = bulkOps.slice();
      bulkOps = [];
      success = await insertDataInElastic(dataToInsert, stateName, step);
      if (!success) {
        state = await getState(stateName);
        step.status = 'error';
        state.steps[state.steps.length - 1] = step;
        await updateStateInFile(state, stateName);
        return false;
      }
      step.percent = ((loaded / bytes.size) * 100).toFixed(2);
      step.took = (new Date() - start) / 1000;
      state.steps[state.steps.length - 1] = step;
      await updateStateInFile(state, stateName);
    }
    if (step.linesRead % 100000 === 0) {
      logger.info(`${step.linesRead} Lines reads`);
      state.steps[state.steps.length - 1] = step;
      await updateStateInFile(state, stateName);
    }
  }
  // last insertion if there is data left
  if (bulkOps.length > 0) {
    success = await insertDataInElastic(bulkOps, stateName, step);
    if (!success) {
      state = await getState(stateName);
      step.status = 'error';
      state.steps[state.steps.length - 1] = step;
      await updateStateInFile(state, stateName);
      return false;
    }
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
  state.steps[state.steps.length - 1] = step;
  await updateStateInFile(state, stateName);
  return true;
};

/**
 * Update the step the percentage in download regularly until the download is complete
 * @param {String} filepath - path where the file is downloaded
 * @param {Object} info - info of file
 * @param {String} stateName - state filename
 * @param {Object} state - state in JSON format
 * @param {Date} start - download start date
 */
async function updatePercentStepDownload(filepath, info, stateName, start) {
  const state = await getState(stateName);
  if (state.error) {
    return;
  }
  const step = state.steps[state.steps.length - 1];
  let bytes;
  try {
    bytes = await fs.stat(filepath);
  } catch (err) {
    logger.error(`Cannot stat ${filepath}`);
    logger.error(err);
  }
  if (bytes?.size >= info.size) {
    return;
  }
  step.took = (new Date() - start) / 1000;
  step.percent = ((bytes.size / info.size) * 100).toFixed(2);
  state.steps[state.steps.length - 1] = step;
  await updateStateInFile(state, stateName);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  updatePercentStepDownload(filepath, info, stateName, start);
}

/**
 * Start the download of the update file from unpaywall
 * @param {String} stateName - state filename
 * @param {String} info - information of the file to download
 */
const downloadFileFromUnpaywall = async (stateName, info) => {
  let stats;

  const filepath = path.resolve(snapshotsDir, info.filename);
  let alreadyInstalled;
  try {
    alreadyInstalled = await fs.pathExists(filepath);
  } catch (err) {
    logger.error(`Cannot verify if ${filepath} exist`);
    logger.error(err);
    await fail(stateName, err);
    return false;
  }

  if (alreadyInstalled) stats = await fs.stat(filepath);

  // if snapshot already exist and download completely, past
  if (alreadyInstalled && stats.size === info.size) {
    logger.info(`file [${info.filename}] already installed`);
    return true;
  }

  await addStepDownload(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  step.file = info.filename;
  await updateStateInFile(state, stateName);

  let res;
  try {
    res = await axios({
      method: 'get',
      url: info.url,
      responseType: 'stream',
    });
  } catch (err) {
    logger.error(`Cannot request ${info.url}`);
    logger.error(err);
    await fail(stateName, err);
    return false;
  }

  const filePath = path.resolve(snapshotsDir, info.filename);

  logger.info(`file - ${info.filename}`);
  logger.info(`lines - ${info.lines}`);
  logger.info(`size - ${info.size}`);
  logger.info(`to_date - ${info.to_date}`);

  if (res?.data instanceof Readable) {
    await new Promise((resolve, reject) => {
      // download unpaywall file with stream
      const writeStream = res.data.pipe(fs.createWriteStream(filePath));

      const start = new Date();
      // update the percentage of the download step in parallel
      updatePercentStepDownload(filePath, info, stateName, start);

      writeStream.on('finish', async () => {
        stats = await fs.stat(filepath);
        if (stats.size !== info.size) {
          logger.error(`${stats.size} !== ${info.size}`);
          await fail();
          return reject();
        }
        step.status = 'success';
        step.took = (new Date() - start) / 1000;
        step.percent = 100;
        state.steps[state.steps.length - 1] = step;
        await updateStateInFile(state, stateName);
        logger.info('step - end download');
        return resolve();
      });

      writeStream.on('error', async (err) => {
        logger.error(err);
        await fail(stateName, err);
        return reject(err);
      });
    });
  } else {
    const writeStream = await fs.createWriteStream(filePath);
    writeStream.write(res.data);
    writeStream.end();
  }
};

/**
 * ask unpaywall to get information and download links for snapshots files
 * @param {String} stateName - state filename
 * @param {String} url - url to request for the list of update files
 * @param {String} apikey - apikey to request for the list of update files
 * @param {String} interval - interval of snapshot update, day or week
 * @param {Date} startDate - start date of the period
 * @param {Date} endDate - end date of the period
 * @returns {array<object>} information about snapshots files
 */
const askUnpaywall = async (jobConfig) => {
  const start = new Date();
  const {
    stateName,
    url,
    apikey,
    interval,
    startDate,
    endDate,
  } = jobConfig;

  await addStepAskUnpaywall(stateName);
  const state = await getState(stateName);
  const step = state.steps[state.steps.length - 1];
  let res;

  try {
    res = await axios({
      method: 'get',
      url,
      params: {
        api_key: apikey,
        interval,
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    logger.error(`Cannot request ${url}`);
    logger.error(err);
    await fail(stateName, err);
    return false;
  }

  if (res?.status !== 200 || !res?.data?.list?.length) {
    await fail(stateName, `code: ${res?.status} - liss lenght: ${!res?.data?.list?.length}`);
    return false;
  }

  let snapshotsInfo = res.data.list;
  snapshotsInfo = snapshotsInfo
    .reverse()
    .filter((file) => file.filetype === 'jsonl');

  if (interval === 'week') {
    snapshotsInfo = snapshotsInfo
      .filter((file) => new Date(file.to_date).getTime() >= new Date(startDate).getTime())
      .filter((file) => new Date(file.to_date).getTime() <= new Date(endDate).getTime());
  }

  if (interval === 'day') {
    snapshotsInfo = snapshotsInfo
      .filter((file) => new Date(file.date).getTime() >= new Date(startDate).getTime())
      .filter((file) => new Date(file.date).getTime() <= new Date(endDate).getTime());
  }

  step.status = 'success';
  step.took = (new Date() - start) / 1000;
  await updateStateInFile(state, stateName);
  logger.info('step - end ask unpaywall');
  return snapshotsInfo;
};

module.exports = {
  insertDataUnpaywall,
  downloadFileFromUnpaywall,
  askUnpaywall,
};
