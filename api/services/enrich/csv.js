/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const Papa = require('papaparse');
const path = require('path');

const axios = require('../../lib/axios');

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
    given,
    sequence
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
  * @param {array<string>} data array of line that we will enrich
  * @param {string} args attributes that we will enrich
  * @param {string} id - id of process
  * @return {array} ezunpaywall respons
  */
const askEzUnpaywall = async (data, args, id) => {
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
    await fail(id);
    // TODO throw Error
  }
  return response?.data?.data?.getDataUPW;
};

/**
 * Flatten nested properties of an object by seperating keys with dots
 * Example: { foo: { bar: 'foo' } } => { 'foo.bar': 'foo' }
 * @param {Object} obj object need to be flatten
 * @returns {Object} flatten object
 */
const flatten = (obj) => {
  const flattened = {};
  // TODO check if array
  function flattenProp(data, keys) {
    Object.entries(data).forEach(([key, value]) => {
      const newKeys = [...keys, key];
      if (key === 'z_authors') {
        value = value.map((item) => JSON.stringify(item));
        value = value.join(' & ');
        value = value.replace(/{|}|"|:|family|given|sequence/g, '').replace(/,/g, ' ');
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
 * @param {string} headers headers
 * @param {char} separator separator of enriched file
 * @param {*} enrichedFile filepath of enriched file
 * @param {string} stateName - state filename
 */
const writeInFileCSV = async (data, headers, separator, enrichedFile, stateName) => {
  const parsedTab = JSON.stringify(data);
  try {
    const unparse = await Papa.unparse(parsedTab, {
      header: false,
      delimiter: separator,
      columns: headers,
    });
    await fs.writeFile(enrichedFile, `${unparse}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`writeInFileCSV: ${err}`);
    await fail(stateName);
    // TODO throw Error
  }
};

/**
 * enrich header with graphql args
 * @param {array<string>} header - header
 * @param {string} args - graphql args
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
 * @param {*} header - header enriched
 * @param {*} separator - separator of file
 * @param {*} enrichedFile - pathfile of enriched file
 */
const writeHeaderCSV = async (header, separator, enrichedFile) => {
  try {
    await fs.writeFile(enrichedFile, `${header.join(separator)}\r\n`, { flag: 'a' });
  } catch (err) {
    logger.error(`writeHeaderCSV: ${err}`);
  }
};

/**
 * starts the enrichment process for files CSV
 * @param {readable} readStream - readstream of the file you want to enrich
 * @param {string} args - attributes will be add
 * @param {string} separator - separator of enriched file
 * @param {string} id - id of process
 */
const processEnrichCSV = async (readStream, args, separator, id) => {
  if (!args) {
    args = allArgs();
  }
  args = addDOItoGraphqlRequest(args);

  const state = await getState(id);
  const file = `${id}.csv`;
  const enrichedFile = path.resolve(enriched, file);

  try {
    await fs.open(enrichedFile, 'w');
  } catch (err) {
    logger.error(`processEnrichCSV in fs.open: ${err}`);
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
          const response = await askEzUnpaywall(data, args, id);
          enrichTab(tabWillBeEnriched, response);
          await writeInFileCSV(tabWillBeEnriched, headers, separator, enrichedFile);

          // state
          state.linesRead += 1000;
          state.enrichedLines += response.length;
          state.loaded += loaded;
          await updateStateInFile(state, id);
          await parser.resume();
        }
      },
      complete: () => resolve(),
    });
  });
  // last insertion
  if (data.length !== 0) {
    // enrichment
    const response = await askEzUnpaywall(data, args, id);
    enrichTab(data, response);
    await writeInFileCSV(data, headers, separator, enrichedFile);
    // state
    state.linesRead += data.length;
    state.enrichedLines += response.length;
    state.loaded += loaded;
    await updateStateInFile(state, id);
  }

  logger.info(`${state.enrichedLines}/${state.linesRead} enriched lines`);
};

module.exports = {
  processEnrichCSV,
};
