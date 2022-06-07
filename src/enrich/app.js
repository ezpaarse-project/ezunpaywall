const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');
const { pingRedis } = require('./service/redis');
const morgan = require('./lib/morgan');
const cronDeleteOutFiles = require('./lib/cron');

const { name, version } = require('./package.json');

const routerJob = require('./routers/job');
const routerEnrich = require('./routers/enrich');
const routerState = require('./routers/state');
const routerOpenapi = require('./routers/openapi');
const routerPing = require('./routers/ping');

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'states'));
fs.ensureDir(path.resolve(outDir, 'uploaded'));
fs.ensureDir(path.resolve(outDir, 'enriched'));

const isDev = process.env.NODE_ENV === 'development';

const app = express();
app.use(morgan);

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-api-key'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res, next) => res.status(200).json({
  name, version,
}));

app.use(routerJob);
app.use(routerEnrich);
app.use(routerState);
app.use(routerOpenapi);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  if (isDev && error.isServer) {
    error.output.payload.stack = error.stack;
  }

  return res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});

app.listen(5000, () => {
  logger.info('ezunpaywall enrich service listening on 5000');
  pingRedis();
  cronDeleteOutFiles.start();
});
