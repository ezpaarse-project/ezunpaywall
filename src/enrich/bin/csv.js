/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const Papa = require('papaparse');
const path = require('path');

const logger = require('../lib/logger');

const {
  getState,
  updateStateInFile,
  fail,
} = require('../model/state');

const { requestGraphql } = require('../lib/service/graphql');

const uploadDir = path.resolve(__dirname, '..', 'data', 'upload');
const enriched = path.resolve(__dirname, '..', 'data', 'enriched');

/**
 * getter of all the unpaywall attributes that can be used for enrichment in graphql format
 * @returns {String} all attributs in graphql format
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
    version
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
    version
  },
  z_authors {
    family,
    given
  }
}`;

/**
 * add attribute doi to args to be used with Map
 * @param {String} args graphql args
 * @returns {String} args with doi
 */
const addDOItoGraphqlRequest = (args) => {
  args = args.replace(/\s/g, '');
  return `{ doi, ${args.substring(1)}`;
};

/**
 * Flatten nested properties of an object by seperating keys with dots
 * Example: { foo: { bar: 'foo' } } => { 'foo.bar': 'foo' }
 * @param {Object} obj object need to be flatten
 * @returns {Object} flatten object
 */
const flatten = (obj) => {
  const flattened = {};
  function flattenProp(data, keys) {
    Object.entries(data).forEach(([key, value]) => {
      const newKeys = [...keys, key];
      if (key === 'z_authors') {
        value = value.map((item) => JSON.stringify(item));
        value = value.join(' & ');
        value = value.replace(/{|}|"|:|family|given/g, '').replace(/,/g, ' ');
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
};

/**
 * enrich file data with data from a ezunpaywall
 * @param {array<object>} data - array of line that we will enrich
 * @param {array<object>} response - response from ezunpaywall
 * @returns {array<object>} enriched data
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
    let res = results.get(el.doi);
    if (!res) {
      return;
    }
    res = flatten(res);
    el = Object.assign(el, res);
  });
  return data;
};

/**
 * write enriched date in enriched file
 * @param {array<object>} data array of line enriched
 * @param {String} headers headers
 * @param {char} separator separator of enriched file
 * @param {String} enrichedFile filepath of enriched file
 * @param {String} stateName - state filename
 */
const writeInFileCSV = async (data, headers, separator, enrichedFile, stateName) => {
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
    logger.error(`Cannot write ${unparse}\\r\\n in ${enrichedFile}`);
    logger.error(err);
    await fail(stateName);
  }
};

/**
 * enrich header with graphql args
 * @param {array<string>} header - header
 * @param {String} args - graphql args
 * @returns {array<string>} header enriched
 */
const enrichHeaderCSV = (header, args) => {
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
};

/**
 * write header in the enriched file
 * @param {array<string>} header - header enriched
 * @param {char} separator - separator of file
 * @param {String} enrichedFile - pathfile of enriched file
 */
const writeHeaderCSV = async (header, separator, enrichedFile) => {
  try {
    await fs.writeFile(enrichedFile, `${header.join(separator)}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`Cannot write ${header.join(separator)}\\r\\n in ${enrichedFile}`);
    logger.error(err);
  }
};

/**
 * starts the enrichment process for files CSV
 * @param {readable} readStream - readstream of the file you want to enrich
 * @param {String} args - attributes will be add
 * @param {String} separator - separator of enriched file
 * @param {String} id - id of process
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 */
const processEnrichCSV = async (id, index, args, apikey, separator) => {
  const filename = `${id}.csv`;

  const readStream = fs.createReadStream(path.resolve(uploadDir, filename));

  const stateName = `${id}.json`;
  const state = await getState(stateName);

  const enrichedFile = path.resolve(enriched, filename);

  if (!args) {
    args = allArgs();
  }
  args = addDOItoGraphqlRequest(args);

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
          const tabWillBeEnriched = data;
          data = [];
          await parser.pause();

          // enrichment
          const response = await requestGraphql(data, args, stateName, index, apikey);
          enrichTab(tabWillBeEnriched, response);
          await writeInFileCSV(tabWillBeEnriched, headers, separator, enrichedFile);

          // state
          state.linesRead += 1000;
          state.enrichedLines += response.length || 0;
          state.loaded += loaded;
          await updateStateInFile(state, stateName);
          await parser.resume();
        }
      },
      complete: () => resolve(),
    });
  });
  // last insertion
  if (data.length !== 0) {
    // enrichment
    const response = await requestGraphql(data, args, stateName, index, apikey);
    enrichTab(data, response);
    await writeInFileCSV(data, headers, separator, enrichedFile);
    // state
    state.linesRead += data?.length || 0;
    state.enrichedLines += response?.length || 0;
    state.loaded += loaded;
    await updateStateInFile(state, stateName);
  }

  logger.info(`${state.enrichedLines}/${state.linesRead} enriched lines`);
};

module.exports = {
  processEnrichCSV,
};
