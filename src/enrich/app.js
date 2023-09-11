const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const getConfig = require('./lib/config');

const { startConnectionRedis, pingRedis } = require('./lib/services/redis');

require('./lib/cron');

const routerExample = require('./lib/routers/example');
const routerPing = require('./lib/routers/ping');
const routerJob = require('./lib/routers/job');
const routerFile = require('./lib/routers/file');
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

app.use(routerExample);
app.use(routerJob);
app.use(routerFile);
app.use(routerState);
app.use(routerOpenapi);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] ezunpaywall enrich service listening on 3000');
  getConfig();
  await startConnectionRedis();
  pingRedis();
});
