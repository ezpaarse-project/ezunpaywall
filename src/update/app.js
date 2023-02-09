const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const morgan = require('./lib/morgan');
const logger = require('./lib/logger');

const cronDeleteOutFiles = require('./bin/cron/file');

const routerPing = require('./routers/ping');
const routerJob = require('./routers/job');
const routerReport = require('./routers/report');
const routerSnapshot = require('./routers/snapshot');
const routerState = require('./routers/state');
const routerStatus = require('./routers/status');
const routerUnpaywall = require('./routers/unpaywall');
const routerCron = require('./routers/cron');
const routerElastic = require('./routers/elastic');
const routerOpenapi = require('./routers/openapi');

const dataDir = path.resolve(__dirname, 'data');
fs.ensureDir(path.resolve(dataDir));
fs.ensureDir(path.resolve(dataDir, 'reports'));
fs.ensureDir(path.resolve(dataDir, 'states'));
fs.ensureDir(path.resolve(dataDir, 'snapshots'));

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
  logger.info('ezunpaywall update service listening on 3000');
  cronDeleteOutFiles.start();
});
