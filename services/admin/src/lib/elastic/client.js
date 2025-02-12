const fs = require('fs');
const path = require('path');
const { Client } = require('@elastic/elasticsearch');
const { elasticsearch } = require('config');
const { nodeEnv } = require('config');
const appLogger = require('../logger/appLogger');
const elasticMock = require('./mock/client');

const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

let elasticClient;
let ssl;

if (isProd) {
  let ca;
  const caPath = path.resolve(__dirname, '..', '..', 'certs', 'ca.crt');
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

if (isTest) {
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
  });
}

module.exports = elasticClient;
