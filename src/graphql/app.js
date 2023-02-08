const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const responseTime = require('response-time');

const auth = require('./middlewares/auth');

const { name, version } = require('./package.json');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const cronMetrics = require('./bin/cron/metrics');
const { setMetrics } = require('./bin/metrics');

const { pingRedis } = require('./lib/service/redis');

const { pingElastic } = require('./lib/service/elastic');

const schema = require('./graphql');

const routerPing = require('./routers/ping');
const routerOpenapi = require('./routers/openapi');

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

app.get('/', async (req, res, next) => res.status(200).json({
  name, version,
}));

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
