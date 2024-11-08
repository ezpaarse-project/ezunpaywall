const express = require('express');
const cors = require('cors');
const fsp = require('fs/promises');
const path = require('path');
const { paths } = require('config');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const { logConfig } = require('./lib/config');

const { pingRedis, startConnectionRedis, loadDemoAPIKey } = require('./lib/redis');

const cronDemo = require('./lib/cron');

const routerHealthCheck = require('./routers/healthcheck');
const routerPing = require('./routers/ping');
const routerConfig = require('./routers/config');
const routerAdmin = require('./routers/admin');
const routerOpenapi = require('./routers/openapi');
const routerMail = require('./routers/mail');
const routerApikeys = require('./routers/apikey');
const routerElastic = require('./routers/elastic');
const routerCron = require('./routers/cron');
const routerStatus = require('./routers/update/status');
const routerState = require('./routers/update/state');
const routerJob = require('./routers/update/job');
const routerReport = require('./routers/update/report');
const routerChangefile = require('./routers/update/changefile');
const routerSnapshot = require('./routers/update/snapshot');

const cronFile = require('./cron/cleanFile');
const dataUpdate = require('./cron/dataUpdate');
const dataUpdateHistoryCron = require('./cron/dataUpdateHistory');
const cronDownloadSnapshot = require('./cron/downloadSnapshot');

// create data directory
fsp.mkdir(path.resolve(paths.data.changefilesDir), { recursive: true });
fsp.mkdir(path.resolve(paths.data.snapshotsDir), { recursive: true });
fsp.mkdir(path.resolve(paths.data.reportsDir), { recursive: true });

// create log directory
fsp.mkdir(path.resolve(paths.log.applicationDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.accessDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.healthCheckDir), { recursive: true });

const app = express();

app.use(express.json());
app.use(cors());

// initiate healthcheck router with his logger
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

// initiate all other routes
app.use(routerAdmin);
app.use(routerPing);
app.use(routerConfig);
app.use(routerMail);
app.use(routerApikeys);
app.use(routerOpenapi);
app.use(routerPing);
app.use(routerElastic);
app.use(routerStatus);
app.use(routerState);
app.use(routerJob);
app.use(routerReport);
app.use(routerCron);
app.use(routerChangefile);
app.use(routerSnapshot);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl} - this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  appLogger.info(`[express]: ezunpaywall admin service listening on 3000 in [${process.uptime().toFixed(2)}]s`);
  logConfig();
  await startConnectionRedis();
  pingRedis();
  loadDemoAPIKey();
  cronDemo.start();

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
