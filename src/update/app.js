const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const morgan = require('./lib/morgan');
const logger = require('./lib/logger');
const getConfig = require('./lib/config');

const routerPing = require('./lib/routers/ping');
const routerElastic = require('./lib/routers/elastic');
const routerOpenapi = require('./lib/routers/openapi');
const routerUnpaywall = require('./lib/routers/unpaywall');
const routerStatus = require('./lib/routers/status');
const routerState = require('./lib/routers/state');

const routerJob = require('./lib/routers/job');
const routerReport = require('./lib/routers/report');
const routerCron = require('./lib/routers/cron');
const routerSnapshot = require('./lib/routers/snapshot');

const dirPath = require('./lib/path');

require('./lib/cron/file');

// create data directory
fs.ensureDir(path.resolve(dirPath.dataDir));
fs.ensureDir(path.resolve(dirPath.snapshotsDir));
fs.ensureDir(path.resolve(dirPath.reportsDir));

// create all directories for logs unpaywall
const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));
fs.ensureDir(path.resolve(logDir, 'healthcheck'));

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan);

app.use(routerPing);
app.use(routerElastic);
app.use(routerOpenapi);
app.use(routerUnpaywall);
app.use(routerStatus);
app.use(routerState);

app.use(routerJob);
app.use(routerReport);
app.use(routerCron);
app.use(routerSnapshot);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] ezunpaywall update service listening on 3000');
  getConfig();
});
