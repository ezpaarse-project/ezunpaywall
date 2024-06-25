const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { paths } = require('config');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const getConfig = require('./lib/config');

const { pingRedis, startConnectionRedis, loadDemoAPIKey } = require('./lib/services/redis');

const cronDemo = require('./lib/cron');

const routerHealthCheck = require('./lib/routers/healthcheck');
const routerPing = require('./lib/routers/ping');
const routerAdmin = require('./lib/routers/admin');
const routerManage = require('./lib/routers/manage');
const routerOpenapi = require('./lib/routers/openapi');

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
app.use(routerAdmin);
app.use(routerPing);
app.use(routerManage);
app.use(routerOpenapi);
app.use(routerPing);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}: this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  appLogger.info('[express]: ezunpaywall apikey service listening on 3000');
  getConfig();
  await startConnectionRedis();
  pingRedis();
  loadDemoAPIKey();
  cronDemo.start();
});
