const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs-extra');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');

const { name, version } = require('./package.json');

const routerMail = require('./routers/mail');

const outDir = path.resolve(__dirname, 'out');

fs.ensureDir(path.resolve(outDir));
fs.ensureDir(path.resolve(outDir, 'logs'));

const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(cors({
  origin: '*',
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).json({ name, version });
});

app.use(routerMail);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json(boom.notFound(`Cannot ${req.method} ${req.originalUrl}`)));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  if (isDev && error.isServer) {
    error.output.payload.stack = error.stack;
  }

  return res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});

app.listen(8000, () => {
  logger.info('ezunpaywall auth service listening on 8000');
});
