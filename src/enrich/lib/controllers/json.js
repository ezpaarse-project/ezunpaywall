/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const config = require('config');

const logger = require('../logger');

const {
  getState,
  updateStateInFile,
  fail,
} = require('../models/state');

const { requestGraphql } = require('../services/graphql');

const uploadDir = path.resolve(__dirname, '..', '..', 'data', 'upload');
const enrichedDir = path.resolve(__dirname, '..', '..', 'data', 'enriched');

/**
 * Get graphql params to get all unpaywall attributes.
 */
const graphqlConfigWithAllAttributes = ` 
{
  data_standard,doi_url,genre,is_paratext,has_repository_copy,is_oa,journal_is_in_doaj,journal_is_oa,
  journal_issns,journal_issn_l,journal_name,oa_status,published_date,publisher,title,updated,year,
  best_oa_location {
    endpoint_id,evidence,host_type,is_best,license,pmh_id,repository_institution,
    updated,url,url_for_landing_page,url_for_pdf,version
  },
  oa_locations { 
    endpoint_id,evidence,host_type,is_best,license,pmh_id,repository_institution,
    updated,url,url_for_landing_page,url_for_pdf,version
  },
  first_oa_location { 
    endpoint_id,evidence,host_type,is_best,license,pmh_id,repository_institution,
    updated,url,url_for_landing_page,url_for_pdf,version
  },
  z_authors {
    family,
    given,
    sequence,
    ORCID
  }
}`;

/**
 * Add attribute doi to graphql params.
 *
 * @param {string} args - Graphql params.
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
 * @param {Array<Object>} data - Array of line that we will enrich.
 * @param {Array<Object>} response - Response from ezunpaywall.
 *
 * @returns {{ lineEnriched: number, enrichedArray: Array<Object> }} Number of lines
 * enriched and enriched data.
 */
const enrichArray = (data, response) => {
  const enrichedArray = data;
  let lineEnriched = 0;

  if (!response) {
    return { enrichedArray, lineEnriched };
  }

  const results = new Map();

  response.forEach((el) => {
    if (el.doi) {
      results.set(el.doi, el);
    }
  });

  enrichedArray.forEach((el) => {
    if (!el.doi) {
      return;
    }
    const res = results.get(el.doi);
    if (!res) {
      return;
    }
    lineEnriched += 1;
    el = Object.assign(el, res);
  });

  return { lineEnriched, enrichedArray };
};

/**
 * Write enriched data in enriched file.
 *
 * @param {Array<Object>} data - Array of line enriched.
 * @param {string} enrichedFile - Filepath of enriched file.
 * @param {string} stateName - State filename.
 * @param {string} apikey //TODO
 *
 * @returns {Promise<void>}
 */
async function writeInFileJSON(data, enrichedFile, stateName, apikey) {
  const stringTab = `${data.map((el) => JSON.stringify(el)).join('\n')}\n`;
  try {
    await fs.writeFile(enrichedFile, stringTab, { flag: 'a' });
  } catch (err) {
    logger.error(`[job jsonl] Cannot write [${stringTab}] in [${enrichedFile}]`, err);
    await fail(stateName, apikey);
    throw err;
  }
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
 * @param {string} id - Id of process.
 * @param {string} index - Index name of mapping.
 * @param {string} args - Attributes will be add.
 * @param {string} apikey - Apikey of user.
 *
 * @returns {Promise<void>}
 */
async function processEnrichJSON(id, index, args, apikey) {
  const readStream = fs.createReadStream(path.resolve(uploadDir, apikey, `${id}.jsonl`));
  if (!args) {
    args = graphqlConfigWithAllAttributes;
  }
  args = addDOItoGraphqlRequest(args);
  const stateName = `${id}.json`;
  const state = await getState(stateName, apikey);
  const file = `${id}.jsonl`;
  const enrichedFile = path.resolve(enrichedDir, apikey, file);

  try {
    await fs.ensureFile(enrichedFile);
  } catch (err) {
    logger.error(`[job jsonl] Cannot ensure [${enrichedFile}]`, err);
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
    let parsedLine;
    try {
      parsedLine = JSON.parse(line);
      data.push(parsedLine);
    } catch (err) {
      logger.error(`[job jsonl] Cannot parse [${line}] in json format`, err);
      await fail(stateName, apikey);
      return;
    }

    if (data.length === 1000) {
      let response;
      try {
        response = await requestGraphql(data, args, index, apikey);
      } catch (err) {
        logger.error(`[graphql] Cannot request graphql service at ${config.get('graphql.host')}/graphql`, JSON.stringify(err?.response?.data?.errors));
        await fail(stateName, apikey);
        return;
      }
      // enrichment
      const enrichedData = enrichArray(data, response);
      const { enrichedArray } = enrichedData;
      await writeInFileJSON(enrichedArray, enrichedFile, stateName, apikey);
      data = [];

      state.linesRead += 1000;
      state.enrichedLines += response?.length || 0;
      state.loaded += loaded;
      await updateStateInFile(state, stateName);
    }
  }

  // last insertion
  if (data.length !== 0) {
    let response;
    try {
      response = await requestGraphql(data, args, index, apikey);
    } catch (err) {
      logger.error(`[graphql] Cannot request graphql service at ${config.get('graphql.host')}/graphql`, JSON.stringify(err?.response?.data?.errors));
      await fail(stateName, apikey);
      return;
    }
    // enrichment
    const enrichedData = enrichArray(data, response);
    const { enrichedArray } = enrichedData;
    await writeInFileJSON(enrichedArray, enrichedFile, stateName, apikey);
    // state
    state.linesRead += data?.length || 0;
    state.enrichedLines += response?.length || 0;
    state.loaded += loaded;
    await updateStateInFile(state, stateName);
  }
  logger.info(`[job jsonl] ${state.enrichedLines}/${state.linesRead} enriched lines`);
}

module.exports = processEnrichJSON;
