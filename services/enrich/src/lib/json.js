/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fsp = require('fs/promises');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
const config = require('config');

const logger = require('./logger/appLogger');

const {
  updateStateInFile,
  fail,
} = require('../models/state');

const { requestGraphql } = require('./graphql/api');

const { uploadDir, enrichedDir } = config.paths.data;

/**
 * Get graphql params to get all unpaywall attributes.
 */
const graphqlConfigWithAllAttributes = ` 
{
  data_standard, title, genre, is_paratext, published_date, year, doi_url, 
  journal_name, journal_issns, journal_issn_l, journal_is_oa, journal_is_in_doaj, 
  publisher, is_oa, oa_status, has_repository_copy, updated,
  best_oa_location { 
    url, url_for_landing_page, url_for_pdf, license, host_type, 
    is_best, pmh_id, endpoint_id, repository_institution, oa_date,
  },
  first_oa_location { 
    url, url_for_landing_page, url_for_pdf, license, host_type, 
    is_best, pmh_id, endpoint_id, repository_institution, oa_date,
  },
  oa_locations { 
    url, url_for_landing_page, url_for_pdf, license, host_type, 
    is_best, pmh_id, endpoint_id, repository_institution, oa_date,
  },
  oa_locations_embargoed { 
    url, url_for_landing_page, url_for_pdf, license, host_type, 
    is_best, pmh_id, endpoint_id, repository_institution, oa_date,
  },
  z_authors {
    author_position,
    raw_author_name,
    is_corresponding,
    raw_affiliation_strings,
  }
}`;

/**
 * Add attribute doi to graphql params.
 *
 * @param {string} args Graphql params.
 *
 * @returns {string} Graphql params with doi
 */
function addDOItoGraphqlRequest(args) {
  args = args.replace(/\s/g, '');
  return `{ doi, ${args.substring(1)}`;
}

/**
 * Enrich data with response from ezunpaywall.
 *
 * @param {Array<Object>} data Array of line that we will enrich.
 * @param {Array<Object>} response Response from ezunpaywall.
 *
 * @returns {{ lineEnriched: number, enrichedArray: Array<Object> }} Number of lines
 * enriched and enriched data.
 */
function enrichArray(data, response) {
  const enrichedArray = data;
  let lineEnriched = 0;

  if (!response) {
    return { enrichedArray, lineEnriched };
  }

  const results = new Map();

  response.forEach((el) => {
    if (el.doi) {
      results.set(el.doi.toLowerCase(), el);
    }
  });

  enrichedArray.forEach((el) => {
    if (!el.doi) {
      return;
    }
    const res = results.get(el.doi.toLowerCase());
    if (!res) {
      return;
    }
    lineEnriched += 1;
    el = Object.assign(el, res);
  });

  return { lineEnriched, enrichedArray };
}

/**
 * Write enriched data in enriched file.
 *
 * @param {Array<Object>} data Array of line enriched.
 * @param {string} enrichedFile Filepath of enriched file.
 * @param {string} state State of job.
 *
 * @returns {Promise<void>}
 */
async function writeInFileJSON(data, enrichedFile, state) {
  const stringTab = `${data.map((el) => JSON.stringify(el)).join('\n')}\n`;
  try {
    await fsp.writeFile(enrichedFile, stringTab, { flag: 'a' });
  } catch (err) {
    logger.error(`[job][jsonl]: Cannot write [${stringTab}] in [${enrichedFile}]`, err);
    await fail(state);
    throw err;
  }
}

/**
 * Do a graphql request to enrich data and write it on enriched File.
 *
 * @param {Array<String>} data Data that will be enrich.
 * @param {Object} enrichConfig Config of enrich.
 * @param {Object} state State of job.
 *
 * @returns {Promise<void>}
 */
async function enrichInFile(data, enrichConfig, state) {
  const {
    enrichedFile,
    args,
    index,
    loaded,
  } = enrichConfig;

  let response;
  try {
    response = await requestGraphql(data, args, index, state.apikey);
  } catch (err) {
    logger.error(`[graphql]: Cannot request graphql service at ${config.graphql.url}/graphql`, JSON.stringify(err?.response?.data?.errors));
    throw err;
  }
  // enrichment
  const enrichedData = enrichArray(data, response);
  const { enrichedArray } = enrichedData;
  await writeInFileJSON(enrichedArray, enrichedFile, state);

  state.linesRead += data.length;
  state.enrichedLines += response?.length || 0;
  state.loaded += loaded;

  await updateStateInFile(state);
}

/**
 * Starts the enrichment process for JSONL file.
 * step :
 * - read file by paquet of 1000
 * - enrich the paquet
 * - write the enriched data in enriched file
 *
 * A state is updated during the job.
 *
 * @param {string} id Id of process.
 * @param {string} index Index name of mapping.
 * @param {string} args Attributes will be add.
 * @param {string} prefix Prefix of new key will be add.
 * @param {string} state State of job.
 *
 * @returns {Promise<void>}
 */
async function processEnrichJSON(id, index, args, prefix, state) {
  const enrichedFilename = `${id}.jsonl`;
  const enrichedUserDir = path.resolve(enrichedDir, state.apikey);
  const enrichedFile = path.resolve(enrichedDir, state.apikey, enrichedFilename);
  const uploadFile = path.resolve(uploadDir, state.apikey, `${id}.jsonl`);

  const readStream = fs.createReadStream(uploadFile);
  if (!args) {
    args = graphqlConfigWithAllAttributes;
  }
  args = addDOItoGraphqlRequest(args);

  try {
    await fsp.mkdir(enrichedUserDir, { recursive: true });
    await fsp.writeFile(enrichedFile, '', 'utf8');
  } catch (err) {
    logger.error(`[job][jsonl]: Cannot create file [${enrichedFile}]`, err);
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

  const enrichConfig = {
    enrichedFile,
    args,
    index,
    loaded,
  };

  for await (const line of rl) {
    let parsedLine;
    try {
      parsedLine = JSON.parse(line);
      data.push(parsedLine);
    } catch (err) {
      logger.error(`[job][jsonl]: Cannot parse [${line}] in json format`, err);
      await fail(state);
      return;
    }

    if (data.length === 1000) {
      try {
        await enrichInFile(data, enrichConfig, state);
      } catch (err) {
        logger.error(`[job][jsonl]: Cannot enrich in file [${enrichedFile}]`, err);
        await fail(state);
        return;
      }
      data = [];
    }
  }

  // last insertion
  if (data.length !== 0) {
    try {
      await enrichInFile(data, enrichConfig, state);
    } catch (err) {
      logger.error(`[job][jsonl]: Cannot enrich in file [${enrichedFile}]`, err);
      await fail(state);
      return;
    }
  }
  logger.info(`[job][jsonl]: ${state.enrichedLines}/${state.linesRead} enriched lines`);
}

module.exports = processEnrichJSON;
