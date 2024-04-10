const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const { paths } = require('config');

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

require('./lib/cron/file');

// create data directory
fs.ensureDir(path.resolve(paths.data.snapshotsDir));
fs.ensureDir(path.resolve(paths.data.reportsDir));

// create all directories for logs unpaywall
fs.ensureDir(path.resolve(paths.log.applicationDir));
fs.ensureDir(path.resolve(paths.log.accessDir));
fs.ensureDir(path.resolve(paths.log.healthCheckDir));

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
