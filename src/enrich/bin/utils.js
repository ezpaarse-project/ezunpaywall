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
const enrichJSON = async (id, index, args, apikey) => {
  await createState(id);
  await processEnrichJSON(id, index, args, apikey);
  await endState(`${id}.json`);
};

/**
 * start an enrich process with a file give by user
 * @param {readStream} readStream - file need to be enriched
 * @param {String} args - graphql args for enrichment
 * @param {String} id - id of process
 * @param {String} separator - separator of enriched file
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 */
const enrichCSV = async (id, index, args, apikey, separator) => {
  await createState(id);
  await processEnrichCSV(id, index, args, apikey, separator);
  await endState(`${id}.json`);
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
