const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');

const schema = require('./graphql/graphql');

// routers
const RouterOutFiles = require('./routers/outFiles');
const RouterTask = require('./routers/status');
const RouterEnrich = require('./routers/enrich');
const RouterManageDatabase = require('./routers/update');

const { logger } = require('./lib/logger');
const { deleteEnrichedFile } = require('./lib/file');

const {
  initalizeIndex,
} = require('./lib/elastic');

const outDir = path.resolve(__dirname, 'out');
// initiates all out dir
fs.ensureDir(path.resolve(outDir, 'logs'));
fs.ensureDir(path.resolve(outDir, 'download'));
fs.ensureDir(path.resolve(outDir, 'reports'));
fs.ensureDir(path.resolve(outDir, 'enriched'));

// start server
const app = express();

// middleware

app.use(cors());

const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.resolve(outDir, 'logs', 'access.log'), { flags: 'a+' }),
  }));
}

const corsOptions = {
  origin: '*',
  methods: 'GET, POST',
  allowedHeaders: ['Content-Type'],
};

// routers
app.get('/', (req, res) => {
  res.sendFile(path.resolve('homepage.html'));
});

// initialize API graphql
app.use('/graphql', cors(corsOptions), bodyParser.json(), (req, res) => {
  const graphqlQuery = graphqlHTTP({
    schema,
    graphiql: true,
  });
  return graphqlQuery(req, res);
});

app.get('/ping', (req, res) => {
  res.status(200).json({ data: 'pong' });
});

app.use(RouterOutFiles);
app.use(RouterTask);
app.use(RouterEnrich);

app.use(RouterManageDatabase);

// elastic index
initalizeIndex();

/* Errors and unknown routes */
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen('8080', () => {
  logger.info('Server listening on 8080');
  app.emit('ready');
});

cron.schedule('0 1 * * *', async () => {
  logger.info('deleteEnrichedFile');
  await deleteEnrichedFile();
});

module.exports = app;
