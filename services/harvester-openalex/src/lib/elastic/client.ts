import fs from 'fs';
import path from 'path';
import { Client } from '@elastic/elasticsearch';

import appLogger from '~/lib/logger/appLogger';

import { config } from '~/lib/config';

const { elasticsearch } = config;

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
  debug: (...args) => appLogger.debug('[DEBUG]', ...args),
  info: (...args) => appLogger.info('[INFO]', ...args),
  warn: (...args) => appLogger.warn('[WARN]', ...args),
  error: (...args) => appLogger.error('[ERROR]', ...args),
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

export default function getElasticClient() { return elasticClient; }

module.exports = getElasticClient;
