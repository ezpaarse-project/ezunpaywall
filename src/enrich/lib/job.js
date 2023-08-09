const {
  createState,
  endState,
} = require('./models/state');

const processEnrichJSON = require('./json');

const processEnrichCSV = require('./csv');

/**
 * Start an JSONL enrichment process based on an id and its config.
 *
 * @param {string} id - Name of uploaded file without the extension file.
 * @param {string} index - Index name of mapping.
 * @param {string} args - Graphql args for enrichment.
 * @param {string} apikey - Apikey of user.
 *
 * @returns {Promise<void>}
 */
async function enrichJSON(id, index, args, apikey) {
  const state = await createState(id, apikey);
  await processEnrichJSON(id, index, args, state);
  await endState(state);
}

/**
 * Start an CSV enrichment process based on an id and its config.
 *
 * @param {string} id - Name of uploaded file without the extension file.
 * @param {string} index - Index name of mapping.
 * @param {string} args - Graphql args for enrichment.
 * @param {string} apikey - Apikey of user.
 * @param {string} separator - Separator of enriched csv file.
 *
 * @returns {Promise<void>}
 */
async function enrichCSV(id, index, args, apikey, separator) {
  const state = await createState(id, apikey);
  await processEnrichCSV(id, index, args, state, separator);
  await endState(state);
}

module.exports = {
  enrichJSON,
  enrichCSV,
};
