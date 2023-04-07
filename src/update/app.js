const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const morgan = require('./lib/morgan');
const logger = require('./lib/logger');
const getConfig = require('./lib/config');

const cronDeleteOutFiles = require('./lib/controllers/cron/file');

const routerPing = require('./lib/routers/ping');
const routerJob = require('./lib/routers/job');
const routerReport = require('./lib/routers/report');
const routerSnapshot = require('./lib/routers/snapshot');
const routerState = require('./lib/routers/state');
const routerStatus = require('./lib/routers/status');
const routerUnpaywall = require('./lib/routers/unpaywall');
const routerCron = require('./lib/routers/cron');
const routerElastic = require('./lib/routers/elastic');
const routerOpenapi = require('./lib/routers/openapi');

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

app.use(routerJob);
app.use(routerReport);
app.use(routerSnapshot);
app.use(routerState);
app.use(routerStatus);
app.use(routerUnpaywall);
app.use(routerCron);
app.use(routerElastic);
app.use(routerOpenapi);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] ezunpaywall update service listening on 3000');
  getConfig();
  cronDeleteOutFiles.start();
});
