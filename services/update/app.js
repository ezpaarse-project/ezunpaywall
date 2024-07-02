const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const { paths } = require('config');

const accessLogger = require('./src/logger/access');
const appLogger = require('./src/logger/appLogger');

const getConfig = require('./src/config');

const routerHealthCheck = require('./src/routers/healthcheck');
const routerPing = require('./src/routers/ping');
const routerElastic = require('./src/routers/elastic');
const routerOpenapi = require('./src/routers/openapi');
const routerUnpaywall = require('./src/routers/unpaywall');
const routerStatus = require('./src/routers/status');
const routerState = require('./src/routers/state');

const routerJob = require('./src/routers/job');
const routerReport = require('./src/routers/report');
const routerCron = require('./src/routers/cron');
const routerChangefile = require('./src/routers/changefile');
const routerSnapshot = require('./src/routers/snapshot');

const cronFile = require('./src/cron/cleanFile');
const dataUpdate = require('./src/cron/dataUpdate');
const dataUpdateHistoryCron = require('./src/cron/dataUpdateHistory');
const cronDownloadSnapshot = require('./src/cron/downloadSnapshot');

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
  if (cronFile.active) {
    cronFile.start();
  }

  if (dataUpdate.cron.active) {
    dataUpdate.cron.start();
  }

  if (dataUpdateHistoryCron.cron.active) {
    dataUpdateHistoryCron.cron.start();
  }
  if (cronDownloadSnapshot.active) {
    cronDownloadSnapshot.start();
  }
});
