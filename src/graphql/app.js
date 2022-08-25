const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const responseTime = require('response-time');
const boom = require('@hapi/boom');

const auth = require('./middlewares/auth');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const { pingRedis } = require('./lib/service/redis');

const { pingElastic } = require('./lib/service/elastic');

const schema = require('./graphql');

const isDev = process.env.NODE_ENV === 'development';

const routerPing = require('./routers/ping');

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
app.use('/graphql', auth, graphqlHTTP({
  schema,
  graphiql: false,
}));

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json(boom.notFound(`Cannot ${req.method} ${req.originalUrl}`)));
app.use((err, req, res, next) => {
  const error = err.isBoom ? err : boom.boomify(err, { statusCode: err.statusCode });

  if (isDev && error.isServer) {
    error.output.payload.stack = error.stack;
  }

  res.status(error.output.statusCode).set(error.output.headers).json(error.output.payload);
});

app.listen(3000, () => {
  logger.info('ezunpaywall graphQL API listening on 3000');
  pingElastic();
  pingRedis();
});
