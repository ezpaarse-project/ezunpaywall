const {
  createState,
  endState,
} = require('../models/state');

const processEnrichJSON = require('./json');

const processEnrichCSV = require('./csv');

/**
 * Start an JSONL enrichment process based on an id and its config.
 *
 * @param {String} id - Name of uploaded file without the extension file.
 * @param {String} index - Index name of mapping.
 * @param {String} args - Graphql args for enrichment.
 * @param {String} apikey - Apikey of user.
 */
const enrichJSON = async (id, index, args, apikey) => {
  await createState(id, apikey);
  await processEnrichJSON(id, index, args, apikey);
  await endState(id, apikey);
};

/**
 * Start an CSV enrichment process based on an id and its config.
 *
 * @param {String} id - Name of uploaded file without the extension file.
 * @param {String} index - Index name of mapping.
 * @param {String} args - Graphql args for enrichment.
 * @param {String} apikey - Apikey of user.
 * @param {String} separator - Separator of enriched csv file.
 */
const enrichCSV = async (id, index, args, apikey, separator) => {
  await createState(id, apikey);
  await processEnrichCSV(id, index, args, apikey, separator);
  await endState(id, apikey);
};

module.exports = {
  enrichJSON,
  enrichCSV,
};
