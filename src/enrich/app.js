const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const cors = require('cors');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');

const { pingRedis } = require('./lib/service/redis');

const cronDeleteOutFiles = require('./controllers/cron/file');

const routerPing = require('./routers/ping');
const routerJob = require('./routers/job');
const routerEnrich = require('./routers/enrich');
const routerState = require('./routers/state');
const routerOpenapi = require('./routers/openapi');

const dataDir = path.resolve(__dirname, 'data');

fs.ensureDir(path.resolve(dataDir));
fs.ensureDir(path.resolve(dataDir, 'states'));
fs.ensureDir(path.resolve(dataDir, 'upload'));
fs.ensureDir(path.resolve(dataDir, 'enriched'));

const app = express();
app.use(morgan);

app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-api-key'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(routerPing);
app.use(routerJob);
app.use(routerEnrich);
app.use(routerState);
app.use(routerOpenapi);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('ezunpaywall enrich service listening on 3000');
  pingRedis();
  cronDeleteOutFiles.start();
});
