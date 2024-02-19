const config = require('config');
const axios = require('axios');

const unpaywallHost = config.get('unpaywall.host');

/**
 * Update the registry of changefiles of fakeUnpaywall.
 *
 * @param {string} interval - Interval of registry.
 *
 * @returns {Promise<void>}
 */
async function updateChangeFile(interval) {
  return axios({
    method: 'patch',
    url: `${unpaywallHost}/changefiles`,
    params: {
      interval,
    },
  });
}

module.exports = updateChangeFile;
