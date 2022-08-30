const express = require('express');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');

const { name, version } = require('./package.json');

const routerMail = require('./routers/mail');
const routerOpenapi = require('./routers/openapi');

const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(cors({
  origin: '*',
  method: ['GET', 'POST'],
}));

app.use(morgan);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).json({ name, version });
});

app.use(routerMail);
app.use(routerOpenapi);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json(boom.notFound(`Cannot ${req.method} ${req.originalUrl}`)));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  if (isDev && error.isServer) {
    error.output.payload.stack = error.stack;
  }

  return res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});

app.listen(3000, () => {
  logger.info('ezunpaywall mail service listening on 3000');
});
