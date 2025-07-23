/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fsp = require('fs/promises');
const fs = require('fs');
const Papa = require('papaparse');
const path = require('path');
const config = require('config');

const logger = require('./logger/appLogger');

const { updateStateInFile, fail } = require('../models/state');

const { requestGraphql } = require('./graphql/api');

const { uploadDir, enrichedDir } = config.paths.data;

/**
 * get graphql params to get all unpaywall attributes.
 */
const graphqlConfigWithAllAttributes = ` 
{
  data_standard, title, genre, is_paratext, published_date, year, doi_url, 
  journal_name, journal_issns, journal_issn_l,journal_is_oa, journal_is_in_doaj, 
  publisher, is_oa, oa_status, has_repository_copy, updated,
  best_oa_location { 
    url, url_for_landing_page, url_for_pdf, license, host_type, 
    is_best, pmh_id, endpoint_id, repository_institution, oa_date,
  },
  first_oa_location { 
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
 * Flatten nested properties of an object by separating keys with dots.
 * Example: { foo: { bar: 'foo' } } => { 'foo.bar': 'foo' }
 *
 * @param {Object} obj Object need to be flatten.
 *
 * @returns {Object} Flatten object.
 */
function flatten(obj) {
  const flattened = {};
  function flattenProp(data, keys) {
    Object.entries(data).forEach(([key, value]) => {
      const newKeys = [...keys, key];
      if (key === 'z_authors') {
        value = value?.map((item) => JSON.stringify(item));
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
    let res = results.get(el.doi.toLowerCase());
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
 * @param {Array<Object>} data Array of line enriched.
 * @param {Array<string>} headers Headers.
 * @param {string} separator Separator of enriched file.
 * @param {string} enrichedFile Filepath of enriched file.
 * @param {string} stateName State filename.
 *
 * @returns {Promise<void>}
 */
async function writeInFileCSV(data, headers, separator, enrichedFile, state) {
  const stringifiedData = JSON.stringify(data);

  let unparse;
  try {
    unparse = await Papa.unparse(stringifiedData, {
      header: false,
      delimiter: separator,
      columns: headers,
    });
    await fsp.writeFile(enrichedFile, `${unparse}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`[job][csv]: Cannot write [${unparse}] in [${enrichedFile}]`, err);
    await fail(state);
  }
}

/**
 * Enrich the csv header with graphql args.
 *
 * @param {Array<string>} headers csv header.
 * @param {string} prefix Prefix of new column in header.
 * @param {string} args Graphql args.
 *
 * @returns {Promise<Array<string>>} header enriched.
 */
async function enrichHeaderCSV(headers, prefix, args) {
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
        headers.push('z_authors');
      } else {
        deleted.push(res[0]);
        // split graphql object
        const master = res[1];
        const slaves = res[2].split(',');
        // add object graphql on header in csv format
        slaves.forEach((slave) => {
          headers.push(`${master}.${slave}`);
        });
      }
    }
  }
  // take off object graphql from the args string
  deleted.forEach((el) => {
    args = args.replace(el, '');
  });
  // delete duplicate
  const uSet = new Set(headers.concat(args.split(',')));
  let result = [...uSet];
  if (prefix) {
    result = result.map((e) => `${prefix}.${e}`);
  }
  return result;
}

/**
 * Write csv header in the enriched file.
 *
 * @param {Array<string>} headers Csv header.
 * @param {string} separator Separator of csv file.
 * @param {string} filePath Path of the file to write the csv header.
 *
 * @returns {Promise<void>}
 */
async function writeHeaderCSV(headers, separator, filePath) {
  try {
    await fsp.writeFile(filePath, `${headers.join(separator)}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`[job][csv]: Cannot write [${headers.join(separator)}] in [${filePath}]`, err);
  }
}

/**
 * Do a graphql request to enrich data and write it on enriched file.
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
    headers,
    separator,
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
  const { enrichedArray, lineEnriched } = enrichedData;
  await writeInFileCSV(enrichedArray, headers, separator, enrichedFile, state);

  // state
  state.linesRead += data.length;
  state.enrichedLines += lineEnriched || 0;
  state.loaded += loaded;
  await updateStateInFile(state);
}

/**
 * Starts the enrichment process for CSV file.
 * step :
 * - read file by packet of 1000
 * - enrich the packet
 * - write the enriched data in enriched file
 *
 * A state is updated during the job.
 *
 * @param {string} id Id of process.
 * @param {string} index Index name of mapping.
 * @param {string} args Attributes will be add.
 * @param {string} state State of job.
 * @param {string} prefix Prefix of new column in header.
 * @param {string} separator separator of enriched file.
 *
 * @returns {Promise<void>}
 */
async function processEnrichCSV(id, index, args, state, prefix, separator) {
  const enrichedFilename = `${id}.csv`;
  const enrichedUserDir = path.resolve(enrichedDir, state.apikey);
  const enrichedFile = path.resolve(enrichedUserDir, enrichedFilename);
  const uploadFile = path.resolve(uploadDir, state.apikey, `${id}.csv`);

  const readStream = fs.createReadStream(uploadFile);

  if (!args) {
    args = graphqlConfigWithAllAttributes;
  }

  args = addDOItoGraphqlRequest(args);

  try {
    await fsp.mkdir(enrichedUserDir, { recursive: true });
    await fsp.writeFile(enrichedFile, '', 'utf8');
  } catch (err) {
    logger.error(`[job][csv]: Cannot create file [${enrichedFile}]`, err);
    throw err;
  }

  let loaded = 0;

  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  let data = [];
  const headers = [];
  let head = true;

  const enrichConfig = {
    enrichedFile,
    args,
    index,
    headers,
    separator,
    loaded,
  };

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
          enrichConfig.headers = await enrichHeaderCSV(headers, prefix, args);
          await writeHeaderCSV(enrichConfig.headers, separator, enrichedFile);
          await parser.resume();
        }

        if (data.length === 1000) {
          const copyData = [...data];
          data = [];
          await parser.pause();

          try {
            await enrichInFile(copyData, enrichConfig, state);
          } catch (err) {
            logger.error(`[job][csv]: Cannot enrich in file [${enrichedFile}]`, err);
            await fail(state);
            return;
          }

          await parser.resume();
        }
      },
      complete: resolve,
    });
  });
  // last insertion
  if (data.length !== 0) {
    if (head) {
      enrichConfig.headers = await enrichHeaderCSV(headers, args);
      await writeHeaderCSV(headers, separator, enrichedFile);
    }
    try {
      await enrichInFile(data, enrichConfig, state);
    } catch (err) {
      logger.error(`[job][csv]: Cannot enrich in file [${enrichedFile}]`, err);
      await fail(state);
      return;
    }
  }
  logger.info(`[job][csv]: ${state.enrichedLines}/${state.linesRead} enriched lines`);
}

module.exports = processEnrichCSV;
