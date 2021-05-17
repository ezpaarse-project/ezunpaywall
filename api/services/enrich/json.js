/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const uuid = require('uuid');

const axios = require('../../lib/axios');

const { logger } = require('../../lib/logger');

const {
  getState,
  updateStateInFile,
  fail,
} = require('./state');

const enriched = path.resolve(__dirname, '..', '..', 'out', 'enrich', 'enriched');

/**
 * add attribute doi to args to be used with Map
 * @param {string} args graphql args
 * @returns {string} args with doi
 */
const addDOItoGraphqlRequest = (args) => `{ doi, ${args.substring(1)}`;

/**
 * ask ezunpaywall to get informations of unpaywall to enrich a file
 * @param {array<string>} data - array of line that we will enrich
 * @param {string} args - attributes that we will enrich
 * @param {string} stateName - state filename
 * @return {array} ezunpaywall respons
 */
const askEzUnpaywall = async (data, args, stateName) => {
  let dois = [];
  let response = [];
  // contain index of doi
  const map1 = await data.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  try {
    response = await axios({
      method: 'post',
      url: '/graphql',
      data: {
        query: `query ($dois: [ID!]!) {getDataUPW(dois: $dois) ${args.toString()} }`,
        variables: {
          dois,
        },
      },
    });
  } catch (err) {
    logger.error(`askEzUnpaywall: ${err}`);
    await fail(stateName);
    // TODO throw Error
  }
  return response?.data?.data?.getDataUPW;
};

/**
 * concat data from file and response from unpaywall
 * @param {array} data - array of line that we will enrich
 * @param {object} response - response from ezunpaywall
 * @returns {Map} map of enrich
 */
const enrichTab = (data, response) => {
  const results = new Map();

  response.forEach((el) => {
    if (el.doi) {
      results.set(el.doi, el);
    }
  });

  data.forEach((el) => {
    if (!el.doi) {
      return;
    }
    const res = results.get(el.doi);
    if (!res) {
      return;
    }
    el = Object.assign(el, res);
  });
  return data;
};

/**
 * write the array of line enriched in a out file JSON
 * @param {array} data - array of line enriched
 * @param {string} enrichedFile - filepath of enriched file
 */
const writeInFileJSON = async (data, enrichedFile, stateName) => {
  try {
    const stringTab = `${data.map((el) => JSON.stringify(el)).join('\n')}\n`;
    await fs.writeFile(enrichedFile, stringTab, { flag: 'a' });
  } catch (err) {
    logger.error(`writeInFileJSON: ${err}`);
    await fail(stateName);
  }
};

/**
 * starts the enrichment process for files JSON
 * @param {readable} readStream - readstream of the file you want to enrich
 * @param {string} args - attributes will be add
 * @param {string} stateName - state filename
 * @returns {string} name of enriched file
 */
const processEnrichJSON = async (readStream, args, stateName) => {
  const state = await getState(stateName);

  const file = `${uuid.v4()}.jsonl`;
  const enrichedFile = path.resolve(enriched, file);

  try {
    await fs.open(enrichedFile, 'w');
  } catch (err) {
    logger.error(`enrichmentFileCSV in fs.open: ${err}`);
  }

  let loaded = 0;

  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  args = addDOItoGraphqlRequest(args);

  let data = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of rl) {
    try {
      data.push(JSON.parse(line));
    } catch (err) {
      logger.error(`parse line in processEnrichJSON for line : ${line} ${err}`);
    }
    // enrichment
    if (data.length === 1000) {
      const response = await askEzUnpaywall(data, args, stateName);
      enrichTab(data, response);
      await writeInFileJSON(data, enrichedFile, stateName);
      data = [];

      state.linesRead += 1000;
      state.enrichedLines += response.length;
      state.loaded += loaded;
      await updateStateInFile(state, stateName);
    }
  }
  // last insertion
  if (data.length !== 0) {
    const response = await askEzUnpaywall(data, args, stateName);
    data = enrichTab(data, response);
    await writeInFileJSON(data, enrichedFile, stateName);

    state.linesRead += data.length;
    state.enrichedLines += response.length;
    state.loaded += loaded;
    await updateStateInFile(state, stateName);
  }

  logger.info(`${state.enrichedLines}/${state.linesRead} enriched lines`);
  return file;
};

module.exports = {
  processEnrichJSON,
};
