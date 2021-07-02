const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');

const { name, version } = require('./package.json'); 

const { logger } = require('./lib/logger');
const { checkAuth } = require('./middlewares/auth');

// start server
const app = express();

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

// middleware
app.use(cors());

app.use('/graphql', cors(), checkAuth, (req, res) => {
  const graphqlQuery = graphqlHTTP({
    schema,
    graphiql: true,
  });
  return graphqlQuery(req, res);
});

app.get('/ping', (req, res) => {
  res.status(200).json({ data: 'pong' });
});

/* Errors and unknown routes */
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen(3000, () => {
  logger.info('GraphQL API listening on 3000');
});
