const axios = require('axios');
const config = require('config');

const logger = require('../logger');

const {
  fail,
} = require('../../model/state');

const graphql = axios.create({
  baseURL: config.get('graphql.host'),
});
graphql.host = config.get('graphql.host');

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
    logger.error(`Cannot request graphql service at ${graphql.host}/graphql`);
    logger.error(JSON.stringify(err?.response?.data?.errors));
    await fail(stateName);
  }
  return res?.data?.data?.GetByDOI;
}

module.exports = askEzunpaywall;