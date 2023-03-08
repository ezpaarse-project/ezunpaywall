const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const logConfig = require('./lib/config');

const { pingRedis, loadDemoAPIKey } = require('./lib/services/redis');

const cronDemo = require('./lib/cron');

const routerPing = require('./lib/routers/ping');
const routerAdmin = require('./lib/routers/admin');
const routerManage = require('./lib/routers/manage');
const routerOpenapi = require('./lib/routers/openapi');

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));

const app = express();

app.use(morgan);
app.use(express.json());
app.use(cors());

app.use(routerAdmin);
app.use(routerPing);
app.use(routerManage);
app.use(routerOpenapi);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('ezunpaywall apikey service listening on 3000');
  logConfig(true);
  pingRedis();
  loadDemoAPIKey();
  cronDemo.start();
});
