const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const logger = require('./logger');

const client = new Client({
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
  while (elasticStatus?.statusCode !== 200) {
    try {
      elasticStatus = await client.ping();
    } catch (err) {
      logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port}`);
      logger.error(err);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  logger.info(`ping: ${elasticsearch.host}:${elasticsearch.port} ok`);
  return true;
};

module.exports = {
  client,
  pingElastic,
};
