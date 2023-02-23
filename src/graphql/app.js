const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const responseTime = require('response-time');
const fs = require('fs-extra');
const path = require('path');

const auth = require('./lib/middlewares/auth');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const cronMetrics = require('./lib/controllers/cron/metrics');
const { setMetrics } = require('./lib/controllers/metrics');

const { pingRedis } = require('./lib/services/redis');

const { pingElastic } = require('./lib/services/elastic');

const schema = require('./lib/resolvers/graphql');

const routerPing = require('./lib/routers/ping');
const routerOpenapi = require('./lib/routers/openapi');

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));

const app = express();

// middleware
app.use(morgan);
app.use(responseTime());
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'x-api-key'],
  method: ['GET', 'POST'],
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// routers
app.use(routerPing);
app.use(routerOpenapi);

app.use('/', auth, graphqlHTTP({
  schema,
  graphiql: false,
}));

app.use(routerPing);

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('ezunpaywall graphQL API listening on 3000');
  pingElastic();
  pingRedis();
  setMetrics();
  cronMetrics.start();
});
