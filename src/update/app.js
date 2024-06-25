const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const { paths } = require('config');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const getConfig = require('./lib/config');

const routerHealthCheck = require('./lib/routers/healthcheck');
const routerPing = require('./lib/routers/ping');
const routerElastic = require('./lib/routers/elastic');
const routerOpenapi = require('./lib/routers/openapi');
const routerUnpaywall = require('./lib/routers/unpaywall');
const routerStatus = require('./lib/routers/status');
const routerState = require('./lib/routers/state');

const routerJob = require('./lib/routers/job');
const routerReport = require('./lib/routers/report');
const routerCron = require('./lib/routers/cron');
const routerChangefile = require('./lib/routers/changefile');
const routerSnapshot = require('./lib/routers/snapshot');

require('./lib/cron/file');

// create data directory
fs.ensureDir(path.resolve(paths.data.changefilesDir));
fs.ensureDir(path.resolve(paths.data.snapshotsDir));
fs.ensureDir(path.resolve(paths.data.reportsDir));

// create log directory
fs.ensureDir(path.resolve(paths.log.applicationDir));
fs.ensureDir(path.resolve(paths.log.accessDir));
fs.ensureDir(path.resolve(paths.log.healthCheckDir));

const app = express();

app.use(express.json());
app.use(cors());

// initiate healthcheck router with his logger
app.use(routerHealthCheck);

// initiate access logger
app.use(accessLogger);

// initiate all other routes
app.use(routerPing);
app.use(routerElastic);
app.use(routerOpenapi);
app.use(routerUnpaywall);
app.use(routerStatus);
app.use(routerState);
app.use(routerJob);
app.use(routerReport);
app.use(routerCron);
app.use(routerChangefile);
app.use(routerSnapshot);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}: this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  appLogger.info('[express]: ezunpaywall update service listening on 3000');
  getConfig();
});
