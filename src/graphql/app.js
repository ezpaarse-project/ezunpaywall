const express = require('express');
const cors = require('cors');
const { graphqlHTTP } = require('express-graphql');

const { name, version } = require('./package.json');

const { logger } = require('./lib/logger');
const { client, pingElastic } = require('./lib/client');
const { checkAuth } = require('./middlewares/auth');

const schema = require('./graphql');

const app = express();

// middleware
app.use(cors({
  origin: '*',
  allowedHeaders: ['Content-Type', 'X-API-KEY'],
  method: ['GET', 'POST'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', async (req, res) => {
  let elasticStatus;
  try {
    await client.ping();
    elasticStatus = 'OK';
  } catch (err) {
    elasticStatus = 'Error';
  }
  res.status(200).json({ name, version, elasticPing: elasticStatus });
});

app.use('/graphql', checkAuth, graphqlHTTP({
  schema,
  graphiql: true,
}));

pingElastic();

/* Errors and unknown routes */
app.use((req, res, next) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res, next) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('ezunpaywall graphQL API listening on 3000');
});
