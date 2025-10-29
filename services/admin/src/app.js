const Fastify = require('fastify');
const rateLimit = require('@fastify/rate-limit');
const fastifyMultipart = require('@fastify/multipart');
const fastifyCors = require('@fastify/cors');

const fsp = require('fs/promises');
const path = require('path');
const { paths, port } = require('config');
const openapiPlugin = require('./plugins/openapi');

const accessLogger = require('./lib/logger/access');
const appLogger = require('./lib/logger/appLogger');

const { logConfig } = require('./lib/config');

const { pingRedis, loadDemoAPIKey } = require('./lib/redis');
const { initClient } = require('./lib/redis/client');

const cronFile = require('./cron/cleanFile');
const cronDataUpdate = require('./cron/dataUpdate');
const cronDataUpdateHistory = require('./cron/dataUpdateHistory');
const cronDownloadSnapshot = require('./cron/downloadSnapshot');
const cronDoiUpdate = require('./cron/doi');
const cronDemo = require('./cron/demoApikey');

const routerHealthCheck = require('./routers/monitoring/healthcheck');
const routerConfig = require('./routers/monitoring/config');
const routerPing = require('./routers/monitoring/ping');
const routerDisk = require('./routers/monitoring/disk');

const routerJobChangefile = require('./routers/update/job/changefile');
const routerJobSnapshot = require('./routers/update/job/snapshots');
const routerChangefile = require('./routers/update/changefile');
const routerDOI = require('./routers/update/doi');
const routerReport = require('./routers/update/report');
const routerSnapshot = require('./routers/update/snapshot');
const routerState = require('./routers/update/state');
const routerStatus = require('./routers/update/status');

const routerCron = require('./routers/cron');
const routerApiKey = require('./routers/apikey');
const routerElastic = require('./routers/elastic');
const routerLogin = require('./routers/login');
const routerMail = require('./routers/mail');

// create data directory
fsp.mkdir(path.resolve(paths.data.changefilesDir), { recursive: true });
fsp.mkdir(path.resolve(paths.data.snapshotsDir), { recursive: true });
fsp.mkdir(path.resolve(paths.data.reportsDir), { recursive: true });

// create log directory
fsp.mkdir(path.resolve(paths.log.applicationDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.accessDir), { recursive: true });
fsp.mkdir(path.resolve(paths.log.healthcheckDir), { recursive: true });

async function buildApp() {
  const fastify = Fastify();

  await fastify.register(rateLimit);
  await fastify.register(fastifyMultipart);

  logConfig();

  await fastify.register(
    fastifyCors,
    { origin: '*' },
  );

  fastify.register(openapiPlugin);

  // register routes
  fastify.register(routerHealthCheck);
  fastify.register(routerConfig);
  fastify.register(routerPing);
  fastify.register(routerDisk);

  fastify.register(routerJobChangefile);
  fastify.register(routerJobSnapshot);

  fastify.register(routerChangefile);
  fastify.register(routerDOI);
  fastify.register(routerReport);
  fastify.register(routerSnapshot);
  fastify.register(routerState);
  fastify.register(routerStatus);

  fastify.register(routerCron);
  fastify.register(routerApiKey);
  fastify.register(routerElastic);
  fastify.register(routerLogin);
  fastify.register(routerMail);

  // Errors and unknown routes
  fastify.setErrorHandler((error, request, reply) => {
    reply.status(404).send({ message: `Cannot ${request.method} ${request.url} - this route does not exist.` });
  });

  fastify.setErrorHandler((error, request, reply) => {
    reply.status(500).send({ message: error.message });
  });

  // cron
  if (cronDemo?.cron?.active) { cronDemo.cron.start(); }
  if (cronFile?.cron?.active) { cronFile.cron.start(); }
  if (cronDataUpdate?.cron?.active) { cronDataUpdate.cron.start(); }
  if (cronDataUpdateHistory?.cron?.active) { cronDataUpdateHistory.cron.start(); }
  if (cronDownloadSnapshot?.active) { cronDownloadSnapshot.start(); }
  if (cronDoiUpdate?.active) { cronDoiUpdate.start(); }

  // redis
  await initClient();
  pingRedis();
  loadDemoAPIKey();

  return fastify;
}

async function start() {
  const app = await buildApp();
  const address = await app.listen({ port, host: '::' });
  appLogger.info(`[fastify]: ezunpaywall admin service listening on [${address}] in [${process.uptime().toFixed(2)}]s`);
}

if (require.main === module) {
  start();
}

module.exports = buildApp;
