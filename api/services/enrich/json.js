/* eslint-disable consistent-return */
/* eslint-disable no-param-reassign */
/* eslint-disable camelcase */
const fs = require('fs-extra');
const readline = require('readline');
const path = require('path');
const uuid = require('uuid');

const { logger } = require('../../lib/logger');

const { fetchEzUnpaywall } = require('./utils');
const {
  incrementlinesRead,
  incrementenrichedLines,
  incrementLoaded,
  endState,
  getState,
} = require('./state');

const enriched = path.resolve(__dirname, '..', '..', 'out', 'enriched');

const setEnrichAttributesJSON = () => [
  'oa_locations.evidence',
  'oa_locations.host_type',
  'oa_locations.is_best',
  'oa_locations.license',
  'oa_locations.pmh_id',
  'oa_locations.updated',
  'oa_locations.url',
  'oa_locations.url_for_landing_page',
  'oa_locations.url_for_pdf',
  'oa_locations.version',
  'best_oa_location.evidence',
  'best_oa_location.host_type',
  'best_oa_location.is_best',
  'best_oa_location.license',
  'best_oa_location.pmh_id',
  'best_oa_location.updated',
  'best_oa_location.url',
  'best_oa_location.url_for_landing_page',
  'best_oa_location.url_for_pdf',
  'best_oa_location.version',
  'first_oa_location.evidence',
  'first_oa_location.host_type',
  'first_oa_location.is_best',
  'first_oa_location.license',
  'first_oa_location.pmh_id',
  'first_oa_location.updated',
  'first_oa_location.url',
  'first_oa_location.url_for_landing_page',
  'first_oa_location.url_for_pdf',
  'first_oa_location.version',
  'z_authors.family',
  'z_authors.given',
  'z_authors.sequence',
  'data_standard',
  'doi_url',
  'genre',
  'is_paratext',
  'is_oa',
  'journal_is_in_doaj',
  'journal_is_oa',
  'journal_issns',
  'journal_issn_l',
  'journal_name',
  'oa_status',
  'published_date',
  'publisher',
  'title',
  'updated',
  'year',
];

/**
 * parse the complexes attributes so that they can be used in the graphql query
 * @param {*} name name of param
 * @param {*} attribute attributes of param
 */
const stringifyAttributes = (name, attributes) => {
  let res;
  if (attributes.length !== 0) {
    res = attributes.join(',');
  }
  res = `${name}{${res}}`;
  return res;
};

/**
 * sortAttr if is a complexe attributes
 * @param {*} attr
 */
const sortAttr = (
  attr,
  best_oa_location,
  first_oa_location,
  oa_locations,
  z_authors,
  fetchAttributes,
) => {
  // complexe attributes (like best_oa_location.license)
  if (attr.includes('.')) {
    const str = attr.split('.');
    if (str[0] === 'best_oa_location') {
      best_oa_location.push(str[1]);
    }
    if (str[0] === 'first_oa_location') {
      first_oa_location.push(str[1]);
    }
    if (str[0] === 'oa_locations') {
      oa_locations.push(str[1]);
    }
    if (str[0] === 'z_authors') {
      z_authors.push(str[1]);
    }
  } else {
    // simple attributes (like is_oa)
    fetchAttributes.push(attr);
  }
  return {
    best_oa_location, first_oa_location, oa_locations, z_authors, fetchAttributes,
  };
};

/**
 * parse the attributes so that they can be used in the graphql query
 */
const createFetchAttributes = (enrichAttributesJSON) => {
  let fetchAttributes = [];

  let best_oa_location = [];
  let first_oa_location = [];
  let oa_locations = [];
  let z_authors = [];

  let value;

  if (typeof enrichAttributesJSON === 'string') {
    value = sortAttr(
      enrichAttributesJSON,
      best_oa_location,
      first_oa_location,
      oa_locations,
      z_authors,
      fetchAttributes,
    );
    best_oa_location = value.best_oa_location;
    first_oa_location = value.first_oa_location;
    oa_locations = value.oa_locations;
    z_authors = value.z_authors;
    fetchAttributes = value.fetchAttributes;
  } else {
    enrichAttributesJSON.forEach((attr) => {
      value = sortAttr(
        attr,
        best_oa_location,
        first_oa_location,
        oa_locations,
        z_authors,
        fetchAttributes,
      );
      best_oa_location = value.best_oa_location;
      first_oa_location = value.first_oa_location;
      oa_locations = value.oa_locations;
      z_authors = value.z_authors;
      fetchAttributes = value.fetchAttributes;
    });
  }

  if (best_oa_location.length !== 0) {
    best_oa_location = stringifyAttributes('best_oa_location', best_oa_location);
    fetchAttributes.push(best_oa_location);
  }
  if (first_oa_location.length !== 0) {
    first_oa_location = stringifyAttributes('first_oa_location', first_oa_location);
    fetchAttributes.push(first_oa_location);
  }
  if (oa_locations.length !== 0) {
    oa_locations = stringifyAttributes('oa_locations', oa_locations);
    fetchAttributes.push(oa_locations);
  }
  if (z_authors.length !== 0) {
    z_authors = stringifyAttributes('z_authors', z_authors);
    fetchAttributes.push(z_authors);
  }
  return fetchAttributes;
};

/**
 * checks if the attributes entered by the command are related to the unpaywall data model
 * @param {*} attr String of attributes
 */
const checkAttributesJSON = (attrs, enrichAttributesJSON) => {
  const res = [];
  if (attrs.includes(',')) {
    attrs = attrs.split(',');
    attrs.forEach((attr) => {
      if (enrichAttributesJSON.includes(attr)) {
        res.push(attr);
      } else {
        logger.error(`attribut ${attr} cannot be enriched on JSON file`);
        return false;
      }
    });
  } else if (enrichAttributesJSON.includes(attrs)) {
    res.push(attrs);
  } else {
    logger.error(`attribut ${attrs} cannot be enriched on JSON file`);
    return false;
  }
  return res;
};

/**
 * @param {*} tab array of line that we will enrich
 * @param {*} response response from ez-unpaywall
 */
const enrichTab = (tab, response) => {
  const results = new Map();
  // index on doi
  response.forEach((el) => {
    if (el.doi) {
      results.set(el.doi, el);
    }
  });

  // enrich
  tab.forEach((el) => {
    if (!el.doi) {
      return;
    }
    const data = results.get(el.doi);
    if (!data) {
      return;
    }
    el = Object.assign(el, data);
  });
};

/**
 * write the array of line enriched in a out file JSON
 * @param {*} tab array of line enriched
 */
const writeInFileJSON = async (tab, enrichedFile) => {
  try {
    const stringTab = `${tab.map((el) => JSON.stringify(el)).join('\n')}\n`;
    await fs.writeFile(enrichedFile, stringTab, { flag: 'a' });
  } catch (err) {
    logger.error(`writeInFileJSON: ${err}`);
  }
};

/**
 * starts the enrichment process for files JSON
 * @param readStream read the stream of the file you want to enrich
 * @param args attributes will be add
 */
const enrichmentFileJSON = async (readStream, attributs, state) => {
  const file = `${uuid.v4()}.jsonl`;
  const enrichedFile = path.resolve(enriched, file);

  let enrichAttributesJSON = setEnrichAttributesJSON();
  if (attributs.length) {
    enrichAttributesJSON = attributs;
  }
  const fetchAttributes = createFetchAttributes(enrichAttributesJSON);

  fs.openSync(enrichedFile, 'w');

  let linesRead = 0;
  let lineEnrich = 0;
  let loaded = 0;

  readStream.on('data', (chunk) => {
    loaded += chunk.length;
  });

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  let tab = [];
  // eslint-disable-next-line no-restricted-syntax
  for await (const line of rl) {
    try {
      tab.push(JSON.parse(line));
    } catch (err) {
      logger.error(`parse line in enrichmentFileJSON for line : ${line} ${err}`);
    }
    if (tab.length === 1000) {
      // enrichment
      const response = await fetchEzUnpaywall(tab, fetchAttributes);
      enrichTab(tab, response);
      await writeInFileJSON(tab, enrichedFile);
      tab = [];

      // state
      lineEnrich += response.length;
      await incrementenrichedLines(state, lineEnrich);
      await incrementlinesRead(state, 1000);
      await incrementLoaded(state, loaded);
    }
  }
  // last insertion
  if (tab.length !== 0) {
    const response = await fetchEzUnpaywall(tab, fetchAttributes);
    enrichTab(tab, response);
    await writeInFileJSON(tab, enrichedFile);

    lineEnrich += response.length;
    await incrementenrichedLines(state, lineEnrich);
    await incrementlinesRead(state, tab.length);
    await incrementLoaded(state, loaded);
  }
  await endState(state);
  state = await getState(state);
  logger.info(`${lineEnrich}/${linesRead} enriched lines`);
  return file;
};

module.exports = {
  enrichmentFileJSON,
  checkAttributesJSON,
  setEnrichAttributesJSON,
};
