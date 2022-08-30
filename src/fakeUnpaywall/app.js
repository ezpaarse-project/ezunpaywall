const express = require('express');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');

const updateChangefilesExample = require('./bin/changefiles');

const routerPing = require('./routers/ping');
const routerSnapshots = require('./routers/snapshots');
const routerChangeFiles = require('./routers/changefiles');

// start server
const app = express();

app.use('/snapshots', cors());
app.use(express.json());
app.use(routerPing);
app.use(routerSnapshots);
app.use(routerChangeFiles);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json(boom.notFound(`Cannot ${req.method} ${req.originalUrl}`)));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  error.output.payload.stack = error.stack;

  return res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});
app.listen(3000, async () => {
  logger.info('fakeUnpaywall service listening on 3000');
  await updateChangefilesExample('day');
  await updateChangefilesExample('week');
});

module.exports = app;
