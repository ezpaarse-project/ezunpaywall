const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');
const { pingRedis } = require('./lib/redis');
const morgan = require('./lib/morgan');

const { name, version } = require('./package.json');

const routerJob = require('./routers/job');
const routerEnrich = require('./routers/enrich');
const routerState = require('./routers/state');

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'states'));
fs.ensureDir(path.resolve(outDir, 'upload'));
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

app.get('/', async (req, res, next) => {
  let redis;
  try {
    redis = await pingRedis();
  } catch (err) {
    return next(boom.boomify(err));
  }
  return res.status(200).json({ name, version, redis: !!redis });
});

app.use(routerJob);
app.use(routerEnrich);
app.use(routerState);

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
});
