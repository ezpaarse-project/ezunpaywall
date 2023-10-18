const express = require('express');
const cors = require('cors');

const logger = require('./lib/logger');

const updateChangefilesExample = require('./lib/controllers/changefiles');

const routerSnapshots = require('./lib/routers/snapshots');
const routerChangeFiles = require('./lib/routers/changefiles');
const routerPing = require('./lib/routers/ping');

// start server
const app = express();

app.use('/snapshots', cors());
app.use(express.json());

app.use(routerSnapshots);
app.use(routerChangeFiles);
app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info('[express] fakeUnpaywall service listening on 3000');
  await updateChangefilesExample('day');
  await updateChangefilesExample('week');
});

module.exports = app;
