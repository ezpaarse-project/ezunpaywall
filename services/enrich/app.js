const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const { paths } = require('config');

const accessLogger = require('./src/logger/access');
const appLogger = require('./src/logger/appLogger');

const getConfig = require('./src/config');

const { startConnectionRedis, pingRedis } = require('./src/services/redis');

require('./src/cron');

const routerHealthCheck = require('./src/routers/healthcheck');
const routerPing = require('./src/routers/ping');
const routerJob = require('./src/routers/job');
const routerFile = require('./src/routers/file');
const routerState = require('./src/routers/state');
const routerOpenapi = require('./src/routers/openapi');

// create data directory
fs.ensureDir(paths.data.enrichedDir);
fs.ensureDir(paths.data.statesDir);
fs.ensureDir(paths.data.uploadDir);

// create log directory
fs.ensureDir(paths.log.healthCheckDir);
fs.ensureDir(paths.log.applicationDir);
fs.ensureDir(paths.log.accessDir);

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-api-key'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routerHealthCheck);

app.use(accessLogger);

app.use(routerJob);
app.use(routerFile);
app.use(routerState);
app.use(routerOpenapi);
app.use(routerPing);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}: this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  appLogger.info('[express]: ezunpaywall enrich service listening on 3000');
  getConfig();
  await startConnectionRedis();
  pingRedis();
});
