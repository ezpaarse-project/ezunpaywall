/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const axios = require('axios');

const logger = require('../lib/logger');

const {
  getState,
  updateStateInFile,
  fail,
} = require('./state');

const uploadDir = path.resolve(__dirname, '..', 'out', 'upload');
const enrichedDir = path.resolve(__dirname, '..', 'out', 'enriched');

/**
 * getter of all the unpaywall attributes that can be used for enrichment in graphql format
 * @returns {string} all attributs in graphql format
 */
const allArgs = () => `
{
  data_standard,
  doi_url,
  genre,
  is_paratext,
  has_repository_copy,
  is_oa,
  journal_is_in_doaj,
  journal_is_oa,
  journal_issns,
  journal_issn_l,
  journal_name,
  oa_status,
  published_date,
  publisher,
  title,
  updated,
  year,
  best_oa_location {
    endpoint_id,
    evidence,
    host_type,
    is_best,
    license,
    pmh_id,
    repository_institution,
    updated,
    url,
    url_for_landing_page,
    url_for_pdf,
    version,
  },
  first_oa_location {
    endpoint_id,
    evidence,
    host_type,
    is_best,
    license,
    pmh_id,
    repository_institution,
    updated,
    url,
    url_for_landing_page,
    url_for_pdf,
    version,
  },
  oa_locations {
    endpoint_id,
    evidence,
    host_type,
    is_best,
    license,
    pmh_id,
    repository_institution,
    updated,
    url,
    url_for_landing_page,
    url_for_pdf,
    version,
  },
  z_authors {
    family,
    given,
    sequence,
  }
}`;

/**
 * add attribute doi to args to be used with Map
 * @param {string} args graphql args
 * @returns {string} args with doi
 */
const addDOItoGraphqlRequest = (args) => {
  args = args.replace(/\s/g, '');
  return `{ doi, ${args.substring(1)}`;
};

/**
 * ask ezunpaywall to get informations of unpaywall to enrich a file
 * @param {array<string>} data - array of line that we will enrich
 * @param {string} args - attributes that we will enrich
 * @param {string} stateName  state filename
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 * @return {array} ezunpaywall response
 */
const askEzunpaywall = async (data, args, stateName, index, apikey) => {
  let dois = [];
  let res = [];
  // contain index of doi
  const map1 = await data.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  dois = dois.join('","');

  // TODO put index
  try {
    res = await axios({
      method: 'POST',
      url: `${process.env.GRAPHQL_URL || 'http://localhost:3000'}/graphql`,
      data:
      {
        query: `{ GetByDOI(dois: ["${dois}"]) ${args.toString()} }`,
      },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'X-API-KEY': apikey,
        index,
      },
    });
  } catch (err) {
    logger.error(`Cannot request graphql service at ${process.env.GRAPHQL_URL || 'http://localhost:3000'}`);
    logger.error(JSON.stringify(err?.response?.data?.errors));
    await fail(stateName);
  }
  return res?.data?.data?.GetByDOI;
};

/**
 * concat data from file and response from unpaywall
 * @param {array} data - array of line that we will enrich
 * @param {object} response - response from ezunpaywall
 * @returns {Map} map of enrich
 */
const enrichTab = (data, response) => {
  if (!response) {
    return data;
  }

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
 * @param {string} stateName  state filename
 */
const writeInFileJSON = async (data, enrichedFile, stateName) => {
  const stringTab = `${data.map((el) => JSON.stringify(el)).join('\n')}\n`;
  try {
    await fs.writeFile(enrichedFile, stringTab, { flag: 'a' });
  } catch (err) {
    logger.error(`Cannot write ${stringTab} in ${enrichedFile}`);
    logger.error(err);
    await fail(stateName);
  }
};

/**
 * starts the enrichment process for files JSON
 * @param {readable} readStream - readstream of the file you want to enrich
 * @param {string} args - attributes will be add
 * @param {string} id - id of process
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 */
const processEnrichJSON = async (id, index, args, apikey) => {
  const readStream = fs.createReadStream(path.resolve(uploadDir, `${id}.jsonl`));
  if (!args) {
    args = allArgs();
  }
  args = addDOItoGraphqlRequest(args);
  const stateName = `${id}.json`;
  const state = await getState(stateName);
  const file = `${id}.jsonl`;
  const enrichedFile = path.resolve(enrichedDir, file);

  try {
    await fs.ensureFile(enrichedFile);
  } catch (err) {
    logger.error(`Cannot ensure ${enrichedFile}`);
    logger.error(err);
  }

  let loaded = 0;

  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  let data = [];

  for await (const line of rl) {
    let li;
    try {
      li = JSON.parse(line);
    } catch (err) {
      logger.error(`Cannot parse "${line}" in json format`);
      logger.error(err);
    }
    data.push(li);

    // enrichment
    if (data.length === 1000) {
      const response = await askEzunpaywall(data, args, stateName, index, apikey);
      enrichTab(data, response);
      await writeInFileJSON(data, enrichedFile, stateName);
      data = [];

      state.linesRead += 1000;
      state.enrichedLines += response?.length || 0;
      state.loaded += loaded;
      await updateStateInFile(state, stateName);
    }
  }

  // last insertion
  if (data.length !== 0) {
    // enrichment
    const response = await askEzunpaywall(data, args, stateName, index, apikey);
    data = enrichTab(data, response);
    await writeInFileJSON(data, enrichedFile, stateName);
    // state
    state.linesRead += data?.length || 0;
    state.enrichedLines += response?.length || 0;
    state.loaded += loaded;
    await updateStateInFile(state, stateName);
  }

  logger.info(`${state.enrichedLines}/${state.linesRead} enriched lines`);
};

module.exports = {
  processEnrichJSON,
};
