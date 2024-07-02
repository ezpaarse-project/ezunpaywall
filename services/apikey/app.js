const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { paths } = require('config');

const accessLogger = require('./src/logger/access');
const appLogger = require('./src/logger/appLogger');

const getConfig = require('./src/config');

const { pingRedis, startConnectionRedis, loadDemoAPIKey } = require('./src/services/redis');

const cronDemo = require('./src/cron');

const routerHealthCheck = require('./src/routers/healthcheck');
const routerPing = require('./src/routers/ping');
const routerAdmin = require('./src/routers/admin');
const routerManage = require('./src/routers/manage');
const routerOpenapi = require('./src/routers/openapi');

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
