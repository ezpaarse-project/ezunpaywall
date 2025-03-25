const express = require('express');
const fsp = require('fs/promises');
const path = require('path');
const cors = require('cors');
const { paths, port } = require('config');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const { logConfig } = require('./lib/config');

const { pingRedis } = require('./lib/redis');
const { initClient } = require('./lib/redis/client');

const cronCleanFile = require('./cron/cleanFile');

const routerHealthCheck = require('./routers/healthcheck');
const routerPing = require('./routers/ping');
const routerCron = require('./routers/cron');
const routerConfig = require('./routers/config');
const routerJob = require('./routers/job');
const routerFile = require('./routers/file');
const routerState = require('./routers/state');
const routerOpenapi = require('./routers/openapi');

// create data directory
fsp.mkdir(path.resolve(paths.data.enrichedDir), { recursive: true });
fsp.mkdir(path.resolve(paths.data.statesDir), { recursive: true });
fsp.mkdir(path.resolve(paths.data.uploadDir), { recursive: true });

// create log directory
fsp.mkdir(path.resolve(paths.log.healthcheckDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.applicationDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.accessDir), { recursive: true });

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-api-key'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routerHealthCheck);

// initiate access logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;

    if (req.url.includes('/healthcheck')) {
      next();
    }

    accessLogger.info({
      ip: req.ip,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent') || '-',
      responseTime: `${duration}ms`,
    });
  });
  return next();
});

app.use(routerJob);
app.use(routerFile);
app.use(routerState);
app.use(routerCron);
app.use(routerOpenapi);
app.use(routerPing);
app.use(routerConfig);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl} - this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

const server = app.listen(port, async () => {
  appLogger.info(`[express]: ezunpaywall enrich service listening on ${port} in [${process.uptime().toFixed(2)}]s`);
  logConfig();
  await initClient();
  pingRedis();

  if (cronCleanFile?.cron?.active) {
    cronCleanFile.cron.start();
  }
});

module.exports = server;
