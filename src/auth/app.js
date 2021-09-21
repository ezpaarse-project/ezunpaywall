const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const logger = require('./lib/logger');
const { name, version } = require('./package.json');
const { load, pingRedis } = require('./lib/redis');

const routerManage = require('./routers/manage');

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'logs'));

const app = express();

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'X-API-KEY'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  let redis = await pingRedis();
  if (redis) {
    redis = 'Alive';
  } else {
    redis = 'Error';
  }
  res.status(200).json({ name, version, redis });
});

pingRedis();
load();

app.use(routerManage);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));
app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

pingRedis();
load();

app.listen(7000, () => {
  logger.info('ezunpaywall auth service listening on 7000');
});
