const {
  createState,
  endState,
} = require('./state');

const {
  processEnrichJSON,
} = require('./json');

const {
  processEnrichCSV,
} = require('./csv');

/**
 * start an enrich process with a file give by user
 * @param {readStream} readStream - file need to be enriched
 * @param {String} args - graphql args for enrichment
 * @param {String} id - id of process
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 */
const enrichJSON = async (readStream, args, id, index, apiKey) => {
  await createState(id);
  await processEnrichJSON(readStream, args, id, index, apiKey);
  await endState(`${id}.json`);
};

/**
 * start an enrich process with a file give by user
 * @param {readStream} readStream - file need to be enriched
 * @param {String} args - graphql args for enrichment
 * @param {String} id - id of process
 * @param {string} separator - separator of enriched file
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 */
const enrichCSV = async (readStream, args, id, separator, index, apiKey) => {
  await createState(id);
  await processEnrichCSV(readStream, args, id, separator, index, apiKey);
  await endState(`${id}.json`);
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
