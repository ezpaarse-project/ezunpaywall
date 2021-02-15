const axios = require('axios');

const logger = require('../../lib/logger');

/**
 * fetch ez-unpaywall with array of dois and fetchAttributes
 * @param {*} tab array of line that we will enrich
 * @param {*} fetchAttributes attributes that we will enrich
 */
const fetchEzUnpaywall = async (tab, fetchAttributes) => {
  let dois = [];
  let response = [];
  // contain index of doi
  const map1 = await tab.map((elem) => elem?.doi);
  // contain array of doi to request ezunpaywall
  dois = await map1.filter((elem) => elem !== undefined);
  try {
    response = await axios({
      method: 'post',
      url: 'http://localhost:8080/graphql',
      data: {
        query: `query ($dois: [ID!]!) {getDataUPW(dois: $dois) { doi, ${fetchAttributes.toString()} }}`,
        variables: {
          dois,
        },
      },
    });
  } catch (err) {
    logger.error('service unavailable');
  }
  return response?.data?.data?.getDataUPW;
};

module.exports = {
  fetchEzUnpaywall,
};
