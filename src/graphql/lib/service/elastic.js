const fs = require('fs-extra');
const path = require('path');

const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const { node } = require('config');
const logger = require('../logger');

const isProd = (node === 'production');

let ssl;

if (isProd) {
  let ca;
  const caPath = path.resolve(__dirname, '..', '..', 'certs', 'ca.crt');
  try {
    ca = fs.readFileSync(caPath, 'utf8');
  } catch {
    logger.error(`Cannot read file in ${caPath}`);
  }
  ssl = {
    ca,
    rejectUnauthorized: true,
  };
}

const elasticClient = new Client({
  node: {
    url: new URL(`${elasticsearch.host}:${elasticsearch.port}`),
    auth: {
      username: elasticsearch.user,
      password: elasticsearch.password,
    },
    ssl,
  },
  requestTimeout: 2000,
});
const pingElastic = async () => {
  let elasticStatus;
  for (let i = 1; i <= 6; i += 1) {
    try {
      elasticStatus = await elasticClient.ping();
    } catch (err) {
      logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${err}`);
    }
    if (elasticStatus?.statusCode !== 200) {
      logger.error(`ping - wait ${2 ** i} seconds`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * i ** 2));
    } else {
      logger.info(`ping - ${elasticsearch.host}:${elasticsearch.port} ok`);
      return true;
    }
  }
  logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} Fail 6 times`);
  return false;
};

module.exports = {
  elasticClient,
  pingElastic,
};
