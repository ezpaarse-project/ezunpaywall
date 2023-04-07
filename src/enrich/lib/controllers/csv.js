/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const Papa = require('papaparse');
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
const enriched = path.resolve(__dirname, '..', '..', 'data', 'enriched');

/**
 * get graphql params to get all unpaywall attributes.
 */
const graphqlConfigWithAllAttributes = ` 
{
  data_standard,doi_url,genre,is_paratext,has_repository_copy,is_oa,journal_is_in_doaj,journal_is_oa,
  journal_issns,journal_issn_l,journal_name,oa_status,published_date,publisher,title,updated,year,
  best_oa_location {
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
 * Flatten nested properties of an object by seperating keys with dots.
 * Example: { foo: { bar: 'foo' } } => { 'foo.bar': 'foo' }
 *
 * @param {Object} obj - Object need to be flatten.
 *
 * @returns {Object} Flatten object.
 */
function flatten(obj) {
  const flattened = {};
  function flattenProp(data, keys) {
    Object.entries(data).forEach(([key, value]) => {
      const newKeys = [...keys, key];
      if (key === 'z_authors') {
        value = value.map((item) => JSON.stringify(item));
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenProp(value, newKeys);
      } else {
        flattened[newKeys.join('.')] = value;
      }
    });
  }
  flattenProp(obj, []);
  return flattened;
}

/**
 * Enrich data with response from ezunpaywall
 *
 * @param {Array<Object>} data - Array of line that we will enrich.
 * @param {Array<Object>} response - Response from ezunpaywall.
 *
 * @returns {Array<Object>} Number of line enriched and enriched data.
 */
function enrichArray(data, response) {
  const enrichedArray = data;
  let lineEnriched = 0;

  if (!response) {
    return enrichedArray;
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
    let res = results.get(el.doi);
    if (!res) {
      return;
    }
    lineEnriched += 1;
    res = flatten(res);
    el = Object.assign(el, res);
  });

  return { enrichedArray, lineEnriched };
}

/**
 * Write enriched data in enriched file.
 *
 * @param {Array<Object>} data - Array of line enriched.
 * @param {string} headers - Headers.
 * @param {string} separator - Separator of enriched file.
 * @param {string} enrichedFile - Filepath of enriched file.
 * @param {string} stateName - State filename.
 */
async function writeInFileCSV(data, headers, separator, enrichedFile, stateName) {
  const parsedTab = JSON.stringify(data);
  let unparse;
  try {
    unparse = await Papa.unparse(parsedTab, {
      header: false,
      delimiter: separator,
      columns: headers,
    });
    await fs.writeFile(enrichedFile, `${unparse}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`[job csv] Cannot write [${unparse}] in [${enrichedFile}]`, err);
    await fail(stateName);
  }
}

/**
 * Enrich the csv header with graphql args.
 *
 * @param {Array<string>} header - csv header.
 * @param {string} args - Graphql args.
 *
 * @returns {Array<string>} header enriched.
 */
async function enrichHeaderCSV(header, args) {
  args = args.replace(/\s/g, '').substring(1);
  args = args.substring(0, args.length - 1);
  const regex = /,([a-z_]+){(.*?)}/gm;
  let res = true;
  const deleted = [];
  // isolate object graphql attributes
  while (res !== null) {
    res = regex.exec(args);
    if (res) {
      // exception with z_authors because it's a array
      if (res[1] === 'z_authors') {
        deleted.push(res[0]);
        header.push('z_authors');
      } else {
        deleted.push(res[0]);
        // split graphql object
        const master = res[1];
        const slaves = res[2].split(',');
        // add object graphql on header in csv format
        slaves.forEach((slave) => {
          header.push(`${master}.${slave}`);
        });
      }
    }
  }
  // take off object graphql from the args string
  deleted.forEach((el) => {
    args = args.replace(el, '');
  });
  // delete doublon
  const uSet = new Set(header.concat(args.split(',')));
  return [...uSet];
}

/**
 * Write csv header in the enriched file.
 *
 * @param {Array<string>} header - Csv header.
 * @param {string} separator - Separator of csv file.
 * @param {string} filePath - Path of the file to write the csv header.
 */
async function writeHeaderCSV(header, separator, filePath) {
  try {
    await fs.writeFile(filePath, `${header.join(separator)}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`[job csv] Cannot write [${header.join(separator)}] in [${filePath}]`, err);
  }
}

/**
 * Starts the enrichment process for CSV file.
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
 * @param {string} separator - separator of enriched file.
 */
async function processEnrichCSV(id, index, args, apikey, separator) {
  const filename = `${id}.csv`;

  const readStream = fs.createReadStream(path.resolve(uploadDir, apikey, filename));

  const stateName = `${id}.json`;
  const state = await getState(stateName, apikey);

  const enrichedFile = path.resolve(enriched, apikey, filename);

  if (!args) {
    args = graphqlConfigWithAllAttributes;
  }

  args = addDOItoGraphqlRequest(args);

  try {
    await fs.ensureFile(enrichedFile);
  } catch (err) {
    logger.error(`[job csv] Cannot ensure ${enrichedFile}`, err);
    throw err;
  }

  let loaded = 0;

  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  let data = [];
  let headers = [];
  let head = true;

  await new Promise((resolve) => {
    Papa.parse(readStream, {
      delimiter: ',',
      header: true,
      transformHeader: (header) => {
        headers.push(header.trim());
        return header.trim();
      },
      step: async (results, parser) => {
        // first step: write enriched header
        data.push(results.data);
        if (head) {
          await parser.pause();
          head = false;
          headers = await enrichHeaderCSV(headers, args);
          await writeHeaderCSV(headers, separator, enrichedFile);
          await parser.resume();
        }

        if (data.length === 1000) {
          const copyData = [...data];
          data = [];
          await parser.pause();

          let response;
          try {
            response = await requestGraphql(copyData, args, index, apikey);
          } catch (err) {
            logger.error(`[graphql] Cannot request graphql service at ${config.get('graphql.host')}/graphql`, JSON.stringify(err?.response?.data?.errors));
            await fail(stateName, apikey);
            return;
          }
          // enrichment
          const enrichedData = enrichArray(copyData, response);
          const { enrichedArray, lineEnriched } = enrichedData;
          await writeInFileCSV(enrichedArray, headers, separator, enrichedFile);

          // state
          state.linesRead += 1000;
          state.enrichedLines += lineEnriched || 0;
          state.loaded += loaded;
          await updateStateInFile(state, stateName);
          await parser.resume();
        }
      },
      complete: resolve,
    });
  });
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
    const { enrichedArray, lineEnriched } = enrichedData;
    await writeInFileCSV(enrichedArray, headers, separator, enrichedFile);

    // state
    state.linesRead += data.length || 0;
    state.enrichedLines += lineEnriched || 0;
    state.loaded += loaded;
    await updateStateInFile(state, stateName);
  }

  logger.info(`[job csv] ${state.enrichedLines}/${state.linesRead} enriched lines`);
}

module.exports = processEnrichCSV;
