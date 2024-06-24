const express = require('express');
const fs = require('fs-extra');
const cors = require('cors');
const { paths } = require('config');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const getConfig = require('./lib/config');

const { startConnectionRedis, pingRedis } = require('./lib/services/redis');

require('./lib/cron');

const routerPing = require('./lib/routers/ping');
const routerJob = require('./lib/routers/job');
const routerFile = require('./lib/routers/file');
const routerState = require('./lib/routers/state');
const routerOpenapi = require('./lib/routers/openapi');

// create data directory
fs.ensureDir(paths.data.enrichedDir);
fs.ensureDir(paths.data.statesDir);
fs.ensureDir(paths.data.uploadDir);

// create log directory
fs.ensureDir(paths.log.applicationDir);
fs.ensureDir(paths.log.accessDir);

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
app.use(routerFile);
app.use(routerState);
app.use(routerOpenapi);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] ezunpaywall enrich service listening on 3000');
  getConfig();
  await startConnectionRedis();
  pingRedis();
});
