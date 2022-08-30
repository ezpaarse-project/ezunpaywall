const express = require('express');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');

const { pingRedis, loadDemoAPIKey } = require('./lib/service/redis');
const cronDemo = require('./lib/cron');

const routerPing = require('./routers/ping');
const routerManage = require('./routers/manage');
const routerOpenapi = require('./routers/openapi');

const isDev = process.env.NODE_ENV === 'development';

const app = express();

app.use(morgan);
app.use(express.json());
app.use(cors());

app.use(routerPing);
app.use(routerManage);
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

app.listen(3000, async () => {
  logger.info('ezunpaywall apikey service listening on 3000');
  pingRedis();
  loadDemoAPIKey();
  cronDemo.start();
});
