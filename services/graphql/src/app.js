const express = require('express');
const fsp = require('fs/promises');
const path = require('path');
const cors = require('cors');
const { json } = require('body-parser');
const { ApolloServer } = require('@apollo/server');
const { ApolloServerPluginLandingPageProductionDefault } = require('@apollo/server/plugin/landingPage/default');
const { paths } = require('config');

const { expressMiddleware } = require('@apollo/server/express4');

const { pingRedis } = require('./lib/redis');
const { initClient } = require('./lib/redis/client');

const auth = require('./middlewares/user');
const countDOIPlugin = require('./middlewares/countDOI');
const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');
const { logConfig } = require('./lib/config');
const cronMetrics = require('./controllers/cron/metrics');
const { setMetrics } = require('./lib/metrics');
const { pingElastic } = require('./lib/elastic');

const routerPing = require('./routers/ping');
const routerHealthCheck = require('./routers/healthcheck');
const routerMetrics = require('./routers/metrics');
const routerConfig = require('./routers/config');
const routerOpenapi = require('./routers/openapi');

const typeDefs = require('./models');
const resolvers = require('./resolvers');

// create log directories
fsp.mkdir(path.resolve(paths.log.applicationDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.accessDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.healthCheckDir), { recursive: true });

function configureMiddleware(app) {
  app.use(cors({
    origin: '*',
    allowedHeaders: ['Content-Type', 'x-api-key'],
    methods: ['GET', 'POST'],
  }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (!req.url.includes('/healthcheck')) {
        accessLogger.info({
          ip: req.ip,
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent') || '-',
          responseTime: `${duration}ms`,
          countDOI: req.countDOI || '-',
        });
      }
    });
    next();
  });
}

function configureRoutes(app) {
  app.use(routerHealthCheck);
  app.use(routerPing);
  app.use(routerMetrics);
  app.use(routerConfig);
  app.use(routerOpenapi);
}

async function startApolloServer(app) {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: true,
    csrfPrevention: false,
    plugins: [ApolloServerPluginLandingPageProductionDefault({ footer: false }), countDOIPlugin],
    context: ({ req }) => ({ req }),
  });
  await apolloServer.start();
  app.use('/graphql', cors(), json(), auth, expressMiddleware(apolloServer, { context: async ({ req }) => req }));
}

async function startListening(app) {
  let server;
  return new Promise((resolve, reject) => {
    server = app.listen(3000, async () => {
      appLogger.info(`[express]: GraphQL API listening on 3000 in [${process.uptime().toFixed(2)}]s`);
      await pingElastic();
      setMetrics();
      logConfig();
      await initClient();
      pingRedis();
      if (process.env.NODE_ENV !== 'test') {
        cronMetrics.start();
      }
      resolve(server);
    });

    server.on('error', (err) => {
      console.error('[express]: GraphQL API is on error', err);
      reject(err);
    });
  });
}

async function startServer() {
  const app = express();

  configureMiddleware(app);
  configureRoutes(app);
  await startApolloServer(app);
  const server = await startListening(app);
  return server;
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = startServer;
