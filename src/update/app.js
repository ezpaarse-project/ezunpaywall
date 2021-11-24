const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const morgan = require('./lib/morgan');
const logger = require('./lib/logger');

const { elasticClient, pingElastic, initAlias } = require('./lib/elastic');
const { pingRedis } = require('./lib/redis');
const { name, version } = require('./package.json');
const unpaywallMapping = require('./mapping/unpaywall.json');

const routerJob = require('./routers/job');
const routerReport = require('./routers/report');
const routerSnapshot = require('./routers/snapshot');
const routerState = require('./routers/state');
const routerStatus = require('./routers/status');
const routerUnpaywall = require('./routers/unpaywall');

const outDir = path.resolve(__dirname, 'out');
fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'reports'));
fs.ensureDir(path.resolve(outDir, 'states'));
fs.ensureDir(path.resolve(outDir, 'snapshots'));

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan);

app.get('/', async (req, res) => {
  let elasticStatus;
  try {
    await elasticClient.ping();
    elasticStatus = 'Alive';
  } catch (err) {
    logger.error(`Cannot ping elastic ${err}`);
    elasticStatus = 'Error';
  }

  let redis = await pingRedis();
  if (redis) {
    redis = 'Alive';
  } else {
    redis = 'Error';
  }

  res.status(200).json({
    name, version, elastic: elasticStatus, redis,
  });
});

app.use(routerJob);
app.use(routerReport);
app.use(routerSnapshot);
app.use(routerState);
app.use(routerStatus);
app.use(routerUnpaywall);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(4000, async () => {
  logger.info('ezunpaywall update service listening on 4000');
  pingElastic();
  pingRedis();
  await initAlias('unpaywall', unpaywallMapping, 'upw');
});
