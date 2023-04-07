const fs = require('fs-extra');
const path = require('path');

const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');
const { elasticsearch } = require('config');
const { nodeEnv } = require('config');
const logger = require('../logger');

const isProd = (nodeEnv === 'production');

/**
 * Ping elastic service.
 *
 * @returns {Promise<boolean>}
 */
async function pingElasticWithClient() {
  let ssl;

  if (isProd) {
    let ca;
    const caPath = path.resolve(__dirname, '..', '..', 'certs', 'ca.crt');
    try {
      ca = await fs.readFile(caPath, 'utf8');
    } catch (err) {
      logger.error(`[elastic] Cannot read certificate file in ${caPath}`, err);
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
    logger.error(`[elastic] Cannot ping ${elasticsearch.host}:${elasticsearch.port}`, err);
    return err.message;
  }
  if (elasticStatus?.statusCode !== 200) {
    logger.error(`[elastic] Cannot ping ${elasticsearch.host}:${elasticsearch.port} - ${elasticStatus?.statusCode}`);
    return false;
  }
  return true;
}

module.exports = pingElasticWithClient;
