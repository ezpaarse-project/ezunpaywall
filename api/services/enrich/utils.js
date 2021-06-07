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
 */
const enrichJSON = async (readStream, args, id) => {
  await createState(id);
  await processEnrichJSON(readStream, args, id);
  await endState(id);
};

/**
 * start an enrich process with a file give by user
 * @param {readStream} readStream - file need to be enriched
 * @param {String} args - graphql args for enrichment
 * @param {string} separator - separator of enriched file
 * @param {String} id - id of process
 */
const enrichCSV = async (readStream, args, separator, id) => {
  await createState(id);
  await processEnrichCSV(readStream, args, separator, id);
  await endState(id);
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
