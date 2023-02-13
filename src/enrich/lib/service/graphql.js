const axios = require('axios');
const config = require('config');

const logger = require('../logger');

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
async function requestGraphql(data, args, stateName, index, apikey) {
  let dois = [];
  let res = [];
  // contain index of doi
  const map1 = await data.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  dois = dois.join('","');

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
  return res?.data?.data?.GetByDOI;
}

async function pingGraphql() {
  let res;
  try {
    res = await graphql({
      method: 'GET',
      url: '/ping',
    });
  } catch (err) {
    logger.error(err);
    return err?.message;
  }
  if (res?.status === 204) return true;
  return false;
}

module.exports = {
  requestGraphql,
  pingGraphql,
};
