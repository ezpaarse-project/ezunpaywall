const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const getConfig = require('./lib/config');

const { pingRedis } = require('./lib/services/redis');

const cronDeleteOutFiles = require('./lib/controllers/cron/file');

const routerPing = require('./lib/routers/ping');
const routerJob = require('./lib/routers/job');
const routerEnrich = require('./lib/routers/enrich');
const routerState = require('./lib/routers/state');
const routerOpenapi = require('./lib/routers/openapi');

const dataDir = path.resolve(__dirname, 'data');

fs.ensureDir(path.resolve(dataDir));
fs.ensureDir(path.resolve(dataDir, 'states'));
fs.ensureDir(path.resolve(dataDir, 'upload'));
fs.ensureDir(path.resolve(dataDir, 'enriched'));

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));

const app = express();
app.use(morgan);

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-api-key'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routerJob);
app.use(routerEnrich);
app.use(routerState);
app.use(routerOpenapi);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('ezunpaywall enrich service listening on 3000');
  getConfig(true);
  pingRedis();
  cronDeleteOutFiles.start();
});
