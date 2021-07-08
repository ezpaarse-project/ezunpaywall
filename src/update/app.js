const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const { logger } = require('./lib/logger');
const { name, version } = require('./package.json');

const routerJob = require('./routers/job');
const routerReport = require('./routers/report');
const routerSnapshot = require('./routers/snapshot');
const routerState = require('./routers/state');
const routerStatus = require('./routers/status');

const outDir = path.resolve(__dirname, 'out');
fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'logs'));
fs.ensureDir(path.resolve(outDir, 'reports'));
fs.ensureDir(path.resolve(outDir, 'states'));
fs.ensureDir(path.resolve(outDir, 'snapshots'));

const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

app.use(routerJob);
app.use(routerReport);
app.use(routerSnapshot);
app.use(routerState);
app.use(routerStatus);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(4000, () => {
  logger.info('ezunpaywall update service listening on 4000');
});
