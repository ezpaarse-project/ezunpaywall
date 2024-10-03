const express = require('express');
const fsp = require('fs/promises');
const path = require('path');
const cors = require('cors');
const { json } = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginLandingPageProductionDefault } = require('@apollo/server/plugin/landingPage/default');
const { paths } = require('config');

const { expressMiddleware } = require('@apollo/server/express4');

const { pingRedis, startConnectionRedis } = require('./lib/redis');

const auth = require('./middlewares/auth');
const countDOIPlugin = require('./middlewares/countDOI');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const getConfig = require('./lib/config');

const cronMetrics = require('./controllers/cron/metrics');
const { setMetrics } = require('./controllers/metrics');

const { pingElastic } = require('./lib/elastic');

const routerHealthCheck = require('./routers/healthcheck');
const routerPing = require('./routers/ping');
const routerOpenapi = require('./routers/openapi');

const typeDefs = require('./models');
const resolvers = require('./resolvers');

// create log directory
fsp.mkdir(path.resolve(paths.log.applicationDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.accessDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.healthCheckDir), { recursive: true });

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

  app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'x-api-key'],
    method: ['GET', 'POST'],
  }));

  // initiate healthcheck router with his logger
  app.use(routerHealthCheck);

  // initiate access logger
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;

      if (req.url.includes('/healthcheck')) {
        next();
      }

      accessLogger.info({
        ip: req.ip,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        userAgent: req.get('User-Agent') || '-',
        responseTime: `${duration}ms`,
        countDOI: req.countDOI,
      });
    });
    return next();
  });

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
