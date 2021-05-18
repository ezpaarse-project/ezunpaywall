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
 * @param {readStream} readStream file need to be enriched
 * @param {String} args graphql args for enrichment
 * @returns {string} name of enriched file
 */
const enrichJSON = async (readStream, args) => {
  const statename = await createState();
  const filename = await processEnrichJSON(readStream, args, statename);
  await endState(statename);
  return filename;
};

/**
 * start an enrich process with a file give by user
 * @param {readStream} readStream file need to be enriched
 * @param {String} args graphql args for enrichment
 * @param {string} separator separator of enriched file
 * @returns {string} name of enriched file
 */
const enrichCSV = async (readStream, args, separator) => {
  const statename = await createState();
  const filename = await processEnrichCSV(readStream, args, separator, statename);
  await endState(statename);
  return filename;
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
