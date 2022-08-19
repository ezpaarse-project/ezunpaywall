const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const boom = require('@hapi/boom');

const morgan = require('./lib/morgan');
const logger = require('./lib/logger');
const cronDeleteOutFiles = require('./lib/cron');

const { pingElastic, initAlias } = require('./service/elastic');
const { pingRedis } = require('./lib/redis');
const unpaywallMapping = require('./mapping/unpaywall.json');

const routerPing = require('./routers/ping');
const routerJob = require('./routers/job');
const routerReport = require('./routers/report');
const routerSnapshot = require('./routers/snapshot');
const routerState = require('./routers/state');
const routerStatus = require('./routers/status');
const routerUnpaywall = require('./routers/unpaywall');
const routerOpenapi = require('./routers/openapi');

const dataDir = path.resolve(__dirname, 'data');
fs.ensureDir(path.resolve(dataDir));
fs.ensureDir(path.resolve(dataDir, 'reports'));
fs.ensureDir(path.resolve(dataDir, 'states'));
fs.ensureDir(path.resolve(dataDir, 'snapshots'));

const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan);

app.use(routerPing);
app.use(routerJob);
app.use(routerReport);
app.use(routerSnapshot);
app.use(routerState);
app.use(routerStatus);
app.use(routerUnpaywall);
app.use(routerOpenapi);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json(boom.notFound(`Cannot ${req.method} ${req.originalUrl}`)));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  if (isDev && error.isServer) {
    error.output.payload.stack = error.stack;
  }

  res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});

app.listen(4000, async () => {
  logger.info('ezunpaywall update service listening on 4000');
  pingElastic();
  pingRedis();
  await initAlias('unpaywall', unpaywallMapping, 'upw');
  await cronDeleteOutFiles.start();
});
