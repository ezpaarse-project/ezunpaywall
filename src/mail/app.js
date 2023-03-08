const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const logConfig = require('./lib/config');

const routerPing = require('./lib/routers/ping');
const routerMail = require('./lib/routers/mail');
const routerOpenapi = require('./lib/routers/openapi');

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));

const app = express();

app.use(cors({
  origin: '*',
  method: ['GET', 'POST'],
}));

app.use(morgan);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(routerPing);
app.use(routerMail);
app.use(routerOpenapi);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('ezunpaywall mail service listening on 3000');
  logConfig();
});
