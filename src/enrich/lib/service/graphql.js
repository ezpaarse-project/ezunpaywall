const axios = require('axios');
const logger = require('../logger');
const {
  fail,
} = require('../../model/state');

/**
 * ask ezunpaywall to get informations of unpaywall to enrich a file
 * @param {array<string>} data - array of line that we will enrich
 * @param {String} args - attributes that we will enrich
 * @param {String} stateName  state filename
 * @param {String} index - index name of mapping
 * @param {String} apikey - apikey of user
 * @return {Array} ezunpaywall response
 */
async function askEzunpaywall(data, args, stateName, index, apikey) {
  let dois = [];
  let res = [];
  // contain index of doi
  const map1 = await data.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  dois = dois.join('","');

  const url = process.env.EZUNPAYWALL_GRAPHQL_URL || 'http://graphql:3000';

  try {
    res = await axios({
      method: 'POST',
      url: `${url}/graphql`,
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
    logger.error(`Cannot request graphql service at ${url}/graphql`);
    logger.error(JSON.stringify(err?.response?.data?.errors));
    await fail(stateName);
  }
  return res?.data?.data?.GetByDOI;
}

module.exports = askEzunpaywall;
