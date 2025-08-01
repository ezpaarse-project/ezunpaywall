/* eslint-disable global-require */
const fs = require('fs');
const { elasticsearch } = require('config');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');

const appLogger = require('../logger/appLogger');

let elasticClient;
let ssl;

if (process.env.NODE_ENV === 'production') {
  let ca;
  const caPath = path.resolve(__dirname, '..', '..', '..', 'certs', 'ca.crt');
  try {
    ca = fs.readFileSync(caPath, 'utf8');
  } catch (err) {
    appLogger.error(`[elastic]: Cannot read elastic certificate file in [${caPath}]`, err);
  }
  ssl = {
    ca,
    rejectUnauthorized: true,
  };
} else {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const customLogger = {
  debug: (...args) => console.debug('[DEBUG]', ...args),
  info: (...args) => console.info('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

if (process.env.NODE_ENV === 'test') {
  const elasticMock = require('./mock');
  appLogger.info('[Elastic]: Using Mock Elasticsearch Client for tests.');
  elasticClient = elasticMock;
} else {
  elasticClient = new Client({
    nodes: elasticsearch.nodes.split(','),
    auth: {
      username: elasticsearch.username,
      password: elasticsearch.password,
    },
    ssl,
    requestTimeout: elasticsearch.timeout,
    logger: customLogger,
  });
}

function getElasticClient() { return elasticClient; }

module.exports = getElasticClient;
