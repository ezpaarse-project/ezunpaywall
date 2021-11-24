const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');
const responseTime = require('response-time');

const { name, version } = require('./package.json');

const auth = require('./middlewares/auth');

const logger = require('./lib/logger');
const morgan = require('./lib/morgan');
const { pingRedis } = require('./lib/redis');
const { elasticClient, pingElastic } = require('./lib/elastic');

const schema = require('./graphql');

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

app.get('/', async (req, res) => {
  let elasticStatus;
  try {
    await elasticClient.ping();
    elasticStatus = 'Alive';
  } catch (err) {
    elasticStatus = 'Error';
  }

  let redis = await pingRedis();

  if (redis) {
    redis = 'Alive';
  } else {
    redis = 'Error';
  }
  res.status(200).json({
    name, version, elastic: elasticStatus, redis,
  });
});

app.use('/graphql', auth, graphqlHTTP({
  schema,
  graphiql: false,
}));

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('ezunpaywall graphQL API listening on 3000');
  pingElastic();
  pingRedis();
});
