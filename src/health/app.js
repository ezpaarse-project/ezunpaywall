const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');

const logger = require('./lib/logger');

const routerPing = require('./lib/routers/ping');
const routerOpenapi = require('./lib/routers/openapi');

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));

const app = express();

app.use(express.json());
app.use(cors());

app.use(routerPing);
app.use(routerOpenapi);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('ezunpaywall health service listening on 3000');
});
