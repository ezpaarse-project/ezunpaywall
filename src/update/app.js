const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const morgan = require('./lib/morgan');
const logger = require('./lib/logger');
const getConfig = require('./lib/config');

const routerGlobalPing = require('./lib/global/routers/ping');
const routerGlobalElastic = require('./lib/global/routers/elastic');
const routerGlobalOpenapi = require('./lib/global/routers/openapi');
const routerGlobalUnpaywall = require('./lib/global/routers/unpaywall');
const routerGlobalSnapshot = require('./lib/global/routers/snapshot');
const routerGlobalStatus = require('./lib/global/routers/status');

const routerClassicJob = require('./lib/classic/routers/job');
const routerClassicReport = require('./lib/classic/routers/report');
const routerClassicState = require('./lib/classic/routers/state');
const routerClassicCron = require('./lib/classic/routers/cron');

const routerHistoryJob = require('./lib/history/routers/job');

require('./lib/classic/cron/file');

const dataDir = path.resolve(__dirname, 'data');
fs.ensureDir(path.resolve(dataDir));
fs.ensureDir(path.resolve(dataDir, 'reports'));
fs.ensureDir(path.resolve(dataDir, 'states'));
fs.ensureDir(path.resolve(dataDir, 'snapshots'));

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan);

app.use(routerGlobalPing);
app.use(routerGlobalElastic);
app.use(routerGlobalOpenapi);
app.use(routerGlobalUnpaywall);
app.use(routerGlobalSnapshot);
app.use(routerGlobalStatus);

app.use(routerClassicJob);
app.use(routerClassicReport);
app.use(routerClassicState);
app.use(routerClassicCron);

app.use(routerHistoryJob);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] ezunpaywall update service listening on 3000');
  getConfig();
});
