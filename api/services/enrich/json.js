/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const { graphql } = require('graphql');

const schema = require('../../graphql/graphql');
const getDataUPW = require('../../graphql/unpaywall/queries');
const { logger } = require('../../lib/logger');

const {
  getState,
  updateStateInFile,
  fail,
} = require('./state');

const enriched = path.resolve(__dirname, '..', '..', 'out', 'enrich', 'enriched');

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
 * @return {array} ezunpaywall response
 */
const askEzUnpaywall = async (data, args, stateName, index) => {
  let dois = [];
  let res = [];
  // contain index of doi
  const map1 = await data.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  dois = dois.join('","');
  try {
    res = await graphql(
      schema,
      `{ getDataUPW(dois: ["${dois}"]) ${args.toString()} }`,
      getDataUPW,
      { index },
    );
    // on peut mettre `${id}.json` dans la fonction graphql
  } catch (err) {
    logger.error(`askEzUnpaywall: ${err}`);
    await fail(stateName);
  }
  return res?.data?.getDataUPW;
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
 * @param {string} stateName  state filename
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
 * @param {string} id - id of process
 * @param {String} index - index name of mapping
 */
const processEnrichJSON = async (readStream, args, id, index) => {
  if (!args) {
    args = allArgs();
  }
  args = addDOItoGraphqlRequest(args);
  const stateName = `${id}.json`;
  const state = await getState(stateName);
  const file = `${id}.jsonl`;
  const enrichedFile = path.resolve(enriched, file);

  try {
    await fs.ensureFile(enrichedFile);
  } catch (err) {
    logger.error(`enrichmentFileCSV in ensureFile: ${err}`);
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
    try {
      const ligne = JSON.parse(line);
      data.push(ligne);
    } catch (err) {
      logger.error(`parse line in processEnrichJSON for line : ${line} ${err}`);
    }
    // enrichment
    if (data.length === 1000) {
      const response = await askEzUnpaywall(data, args, stateName, index);
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
    const response = await askEzUnpaywall(data, args, stateName, index);
    data = enrichTab(data, response);
    await writeInFileJSON(data, enrichedFile, stateName);
    state.linesRead += data.length;
    state.enrichedLines += response.length;
    state.loaded += loaded;
    await updateStateInFile(state, stateName);
  }

  logger.info(`${state.enrichedLines}/${state.linesRead} enriched lines`);
};

module.exports = {
  processEnrichJSON,
};
