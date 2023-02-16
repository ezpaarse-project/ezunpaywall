const fs = require('fs-extra');
const path = require('path');

const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const { node } = require('config');
const logger = require('../logger');

const isProd = (node === 'production');

const pingElasticWithClient = async () => {
  let ssl;

  if (isProd) {
    let ca;
    const caPath = path.resolve(__dirname, '..', '..', 'certs', 'ca.crt');
    try {
      ca = fs.readFileSync(caPath, 'utf8');
    } catch {
      logger.error(`Cannot read elastic certificate file in ${caPath}`);
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
  let elasticStatus;
  try {
    elasticStatus = await elasticClient.ping();
  } catch (err) {
    logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${err}`);
    return err.message;
  }
  if (elasticStatus?.statusCode !== 200) {
    logger.error(`Cannot ping ${elasticsearch.host}:${elasticsearch.port}`);
    return false;
  }
  return true;
};

module.exports = pingElasticWithClient;