const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');
const { name, version } = require('./package.json');
const { pingRedis } = require('./lib/redis');

const routerManage = require('./routers/manage');

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'logs'));

const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', async (req, res) => {
  let redis = await pingRedis();
  if (redis) {
    redis = 'Alive';
  } else {
    redis = 'Error';
  }
  res.status(200).json({ name, version, redis });
});

app.use(routerManage);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  if (isDev && error.isServer) {
    error.output.payload.stack = error.stack;
  }

  res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});

app.listen(7000, async () => {
  logger.info('ezunpaywall apikey service listening on 7000');
  pingRedis();
});
