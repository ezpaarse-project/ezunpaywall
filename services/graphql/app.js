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

const { pingRedis, startConnectionRedis } = require('./src/services/redis');

const auth = require('./src/middlewares/auth');
const countDOIPlugin = require('./src/middlewares/countDOI');

const accessLogger = require('./src/logger/access');
const appLogger = require('./src/logger/appLogger');

const getConfig = require('./src/config');

const cronMetrics = require('./src/controllers/cron/metrics');
const { setMetrics } = require('./src/controllers/metrics');

const { pingElastic } = require('./src/services/elastic');

const routerHealthCheck = require('./src/routers/healthcheck');
const routerPing = require('./src/routers/ping');
const routerOpenapi = require('./src/routers/openapi');

const typeDefs = require('./src/models');
const resolvers = require('./src/resolvers');

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
