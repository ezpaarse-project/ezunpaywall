const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const responseTime = require('response-time');
const cors = require('cors');
const { json } = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginLandingPageProductionDefault } = require('@apollo/server/plugin/landingPage/default');
const { paths } = require('config');

const { expressMiddleware } = require('@apollo/server/express4');

const { pingRedis, startConnectionRedis } = require('./lib/services/redis');

const auth = require('./lib/middlewares/auth');
const countDOIPlugin = require('./lib/middlewares/countDOI');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const getConfig = require('./lib/config');

const cronMetrics = require('./lib/controllers/cron/metrics');
const { setMetrics } = require('./lib/controllers/metrics');

const { pingElastic } = require('./lib/services/elastic');

const routerHealthCheck = require('./lib/routers/healthcheck');
const routerPing = require('./lib/routers/ping');
const routerOpenapi = require('./lib/routers/openapi');

const typeDefs = require('./lib/models');
const resolvers = require('./lib/resolvers');

// create log directory
fs.ensureDir(path.resolve(paths.log.applicationDir));
fs.ensureDir(path.resolve(paths.log.accessDir));
fs.ensureDir(path.resolve(paths.log.healthCheckDir));

process.env.NODE_ENV = 'production';

const server = new ApolloServer({
  typeDefs,
  resolvers,
  introspection: true,
  csrfPrevention: false,
  plugins: [ApolloServerPluginLandingPageProductionDefault({ footer: false }), countDOIPlugin],
  context: ({ req }) => ({ req }),
});

(async () => {
  const app = express();

  app.use(responseTime());
  app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'x-api-key'],
    method: ['GET', 'POST'],
  }));

  // initiate healthcheck router with his logger
  app.use(routerHealthCheck);

  // initiate access logger
  app.use(accessLogger);

  // initiate all other routes
  app.use(routerPing);
  app.use(routerPing);
  app.use(routerOpenapi);

  await server.start();

  // initiate graphql endpoint
  app.use('/graphql', cors(), json(), auth, expressMiddleware(server, { context: async ({ req }) => req }));

  app.listen(3000, async () => {
    appLogger.info('[express]: ezunpaywall graphQL API listening on 3000');
    pingElastic().then(() => {
      setMetrics();
    });
    getConfig();
    await startConnectionRedis();
    pingRedis();

    cronMetrics.start();
  });
})();
