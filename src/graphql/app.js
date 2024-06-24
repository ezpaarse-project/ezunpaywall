const fs = require('fs-extra');
const path = require('path');
const express = require('express');
const responseTime = require('response-time');
const cors = require('cors');
const { json } = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginLandingPageProductionDefault } = require('@apollo/server/plugin/landingPage/default');

const { expressMiddleware } = require('@apollo/server/express4');

const { pingRedis, startConnectionRedis } = require('./lib/services/redis');

const auth = require('./lib/middlewares/auth');
const countDOIPlugin = require('./lib/middlewares/countDOI');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const getConfig = require('./lib/config');

const cronMetrics = require('./lib/controllers/cron/metrics');
const { setMetrics } = require('./lib/controllers/metrics');

const { pingElastic } = require('./lib/services/elastic');

const routerPing = require('./lib/routers/ping');
const routerOpenapi = require('./lib/routers/openapi');

const typeDefs = require('./lib/models');
const resolvers = require('./lib/resolvers');

const logDir = path.resolve(__dirname, 'log');
fs.ensureDir(path.resolve(logDir));
fs.ensureDir(path.resolve(logDir, 'application'));
fs.ensureDir(path.resolve(logDir, 'access'));

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

  app.use(morgan);
  app.use(responseTime());

  app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'x-api-key'],
    method: ['GET', 'POST'],
  }));

  app.use(routerPing);
  app.use(routerOpenapi);

  await server.start();

  app.use('/graphql', cors(), json(), auth, expressMiddleware(server, { context: async ({ req }) => req }));

  app.listen(3000, async () => {
    logger.info('[express] ezunpaywall graphQL API listening on 3000');
    pingElastic().then(() => {
      setMetrics();
    });
    getConfig();
    await startConnectionRedis();
    pingRedis();

    cronMetrics.start();
  });
})();
