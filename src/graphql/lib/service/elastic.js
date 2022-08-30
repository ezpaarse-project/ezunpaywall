const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const logger = require('../logger');

const elasticClient = new Client({
  node: {
    url: new URL(`${elasticsearch.host}:${elasticsearch.port}`),
    auth: {
      username: elasticsearch.user,
      password: elasticsearch.password,
    },
  },
  requestTimeout: 2000,
});

const pingElastic = async () => {
  let elasticStatus;
  for (let i = 1; i <= 4; i += 1) {
    try {
      elasticStatus = await elasticClient.ping();
    } catch (err) {
      logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${err}`);
    }
    if (elasticStatus?.statusCode !== 200) {
      logger.error(`ping - wait ${2 * i} seconds`);
      await new Promise((resolve) => setTimeout(resolve, 2000 * i));
    } else {
      logger.info(`ping - ${elasticsearch.host}:${elasticsearch.port} ok`);
      return true;
    }
  }
  logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} Fail 4 times`);
  return false;
};

module.exports = {
  elasticClient,
  pingElastic,
};
