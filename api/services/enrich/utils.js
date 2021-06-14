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
 */
const enrichJSON = async (readStream, args, id, index) => {
  await createState(id);
  await processEnrichJSON(readStream, args, id, index);
  await endState(`${id}.json`);
};

/**
 * start an enrich process with a file give by user
 * @param {readStream} readStream - file need to be enriched
 * @param {String} args - graphql args for enrichment
 * @param {string} separator - separator of enriched file
 * @param {String} id - id of process
 * @param {String} index - index name of mapping
 */
const enrichCSV = async (readStream, args, separator, id, index) => {
  await createState(id);
  await processEnrichCSV(readStream, args, separator, id, index);
  await endState(`${id}.json`);
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
