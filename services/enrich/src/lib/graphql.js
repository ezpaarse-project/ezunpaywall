const axios = require('axios');
const config = require('config');

const logger = require('./logger/appLogger');

const graphql = axios.create({
  baseURL: config.graphql.host,
  timeout: 30000,
});
graphql.host = config.graphql.host;

/**
 * Request graphql service to get unpaywall data.
 *
 * @param {Array<string>} data Array of line that we will enrich.
 * @param {string} args Requested graphql attributes.
 * @param {string} index Requested index elastic.
 * @param {string} apikey Apikey of user.
 *
 * @return {Promise<Array<Object>>} graphql data ezunpaywall response
 */
async function requestGraphql(data, args, index, apikey) {
  let dois = [];
  let res = [];
  // contain index of doi

  const map1 = await data.map((elem) => elem?.doi);

  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  dois = dois.join('","');

  try {
    res = await graphql({
      method: 'POST',
      url: '/graphql',
      data:
      {
        query: `{ GetByDOI(dois: ["${dois}"]) ${args.toString()} }`,
      },
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-api-key': apikey,
        index,
      },
    });
  } catch (err) {
    logger.error('[graphql]: Cannot get unpaywall data');
    throw err;
  }

  return res?.data?.data?.GetByDOI;
}

/**
 * Ping ezunpaywall graphql service.
 *
 * @returns {Promise<boolean>} ping
 */
async function pingGraphql() {
  let res;
  try {
    res = await graphql({
      method: 'GET',
      url: '/ping',
    });
  } catch (err) {
    logger.error('[graphql]: Cannot request graphql', err);
    return err?.message;
  }
  if (res?.status === 204) return true;
  return false;
}

module.exports = {
  requestGraphql,
  pingGraphql,
};
