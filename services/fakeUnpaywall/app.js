const express = require('express');
const cors = require('cors');

const logger = require('./src/logger');

const updateChangefilesExample = require('./src/controllers/changefiles');

const routerUnpaywall = require('./src/routers/unpaywall');
const routerAdmin = require('./src/routers/admin');
const routerPing = require('./src/routers/ping');

// start server
const app = express();

app.use('/snapshots', cors());
app.use(express.json());

app.use(routerUnpaywall);
app.use(routerAdmin);
app.use(routerPing);

// Errors and unknown routes
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl} - this route does not exist.` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, async () => {
  logger.info(`[express]: fakeUnpaywall service listening on 3000 in [${process.uptime().toFixed(2)}]s`);
  await updateChangefilesExample('day');
  await updateChangefilesExample('week');
});

module.exports = app;
