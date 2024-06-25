const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { paths } = require('config');

const appLogger = require('./lib/logger/appLogger');
const accessLogger = require('./lib/logger/access');

const getConfig = require('./lib/config');

const routerHealthCheck = require('./lib/routers/healthcheck');
const routerPing = require('./lib/routers/ping');
const routerMail = require('./lib/routers/mail');
const routerOpenapi = require('./lib/routers/openapi');

// create log directory
fs.ensureDir(path.resolve(paths.log.applicationDir));
fs.ensureDir(path.resolve(paths.log.accessDir));
fs.ensureDir(path.resolve(paths.log.healthCheckDir));

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: '*',
  method: ['GET', 'POST'],
}));

// initiate healthcheck router with his logger
app.use(routerHealthCheck);

// initiate access logger
app.use(accessLogger);

// initiate all other routes
app.use(routerPing);
app.use(routerMail);
app.use(routerOpenapi);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}: this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  appLogger.info('[express]: ezunpaywall mail service listening on 3000');
  getConfig();
});
