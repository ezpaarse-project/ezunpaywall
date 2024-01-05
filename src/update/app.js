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

const routerUnpaywallJob = require('./lib/unpaywall/routers/job');
const routerUnpaywallReport = require('./lib/unpaywall/routers/report');

const routerUnpaywallCron = require('./lib/unpaywall/routers/cron');
const routerUnpaywallSnapshot = require('./lib/unpaywall/routers/snapshot');

const routerUnpaywallHistoryJob = require('./lib/unpaywallHistory/routers/job');

require('./lib/unpaywall/cron/file');

// create data directory
const dataDir = path.resolve(__dirname, 'data');
fs.ensureDir(path.resolve(dataDir));

// create all directories for unpaywall
const unpaywallDir = path.resolve(dataDir, 'unpaywall');

fs.ensureDir(path.resolve(unpaywallDir));

const unpaywallReportsDir = path.resolve(unpaywallDir, 'reports');
const unpaywallStatesDir = path.resolve(unpaywallDir, 'states');
const unpaywallSnapshotsDir = path.resolve(unpaywallDir, 'snapshots');

fs.ensureDir(path.resolve(unpaywallReportsDir));
fs.ensureDir(path.resolve(unpaywallStatesDir));
fs.ensureDir(path.resolve(unpaywallSnapshotsDir));

// create all directories for history unpaywall
const unpaywallHistoryDir = path.resolve(dataDir, 'unpaywallHistory');
fs.ensureDir(path.resolve(unpaywallHistoryDir));

const unpaywallHistoryReportsDir = path.resolve(unpaywallHistoryDir, 'reports');
const unpaywallHistoryStatesDir = path.resolve(unpaywallHistoryDir, 'states');
const unpaywallHistorySnapshotsDir = path.resolve(unpaywallHistoryDir, 'snapshots');

fs.ensureDir(path.resolve(unpaywallHistoryReportsDir));
fs.ensureDir(path.resolve(unpaywallHistoryStatesDir));
fs.ensureDir(path.resolve(unpaywallHistorySnapshotsDir));

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

app.use(routerUnpaywallJob);
app.use(routerUnpaywallReport);
app.use(routerUnpaywallCron);
app.use(routerUnpaywallSnapshot);

app.use(routerUnpaywallHistoryJob);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] ezunpaywall update service listening on 3000');
  getConfig();
});
