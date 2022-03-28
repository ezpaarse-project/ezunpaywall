const express = require('express');
const cors = require('cors');
const boom = require('@hapi/boom');

const logger = require('./lib/logger');

const { name, version } = require('./package.json');

const updateChangefilesExample = require('./bin/changefiles');

const routerSnapshots = require('./routers/snapshots');
const routerChangeFiles = require('./routers/changefiles');

// start server
const app = express();

app.use('/snapshots', cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

app.use(routerSnapshots);
app.use(routerChangeFiles);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json(boom.notFound(`Cannot ${req.method} ${req.originalUrl}`)));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  error.output.payload.stack = error.stack;

  return res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});
app.listen(12000, async () => {
  logger.info('fakeUnpaywall service listening on 12000');
  await updateChangefilesExample('day');
  await updateChangefilesExample('week');
});

module.exports = app;
