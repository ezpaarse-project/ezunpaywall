const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const logger = require('./lib/logger');
const { name, version } = require('./package.json');

const routerJob = require('./routers/job');
const routerEnrich = require('./routers/enrich');
const routerState = require('./routers/state');

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'logs'));
fs.ensureDir(path.resolve(outDir, 'states'));
fs.ensureDir(path.resolve(outDir, 'upload'));
fs.ensureDir(path.resolve(outDir, 'enriched'));

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'X-API-KEY'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

app.use(routerJob);
app.use(routerEnrich);
app.use(routerState);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(5000, () => {
  logger.info('ezunpaywall enrich service listening on 5000');
});
