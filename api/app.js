const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');
const cron = require('node-cron');

const schema = require('./graphql/graphql');

const RouterEnrich = require('./routers/enrich');
const RouterUpdate = require('./routers/update');

const {
  checkAuth,
} = require('./middlewares/auth');

const { logger } = require('./lib/logger');
const { deleteEnrichedFile } = require('./lib/file');

const {
  initalizeIndex,
} = require('./lib/elastic');

const outDir = path.resolve(__dirname, 'out');
fs.ensureDir(path.resolve(outDir));

const updateDir = path.resolve(outDir, 'update');
fs.ensureDir(path.resolve(updateDir));
fs.ensureDir(path.resolve(updateDir, 'report'));
fs.ensureDir(path.resolve(updateDir, 'state'));
fs.ensureDir(path.resolve(updateDir, 'snapshot'));

const enrichDir = path.resolve(outDir, 'enrich');
fs.ensureDir(path.resolve(enrichDir));
fs.ensureDir(path.resolve(enrichDir, 'state'));
fs.ensureDir(path.resolve(enrichDir, 'enriched'));
fs.ensureDir(path.resolve(enrichDir, 'upload'));

// initiates all out dir
fs.ensureDir(path.resolve(outDir, 'logs'));
fs.ensureDir(path.resolve(outDir, 'reports'));

const corsOptions = {
  origin: '*',
  methods: 'GET, POST',
  allowedHeaders: ['Content-Type'],
};

// start server
const app = express();

// middleware
app.use(cors());

app.use(express.urlencoded({ extended: true }));

const isDev = process.env.NODE_ENV === 'development';
if (isDev) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.resolve(outDir, 'logs', 'access.log'), { flags: 'a+' }),
  }));
}
// routers
// initialize API graphql
app.use('/graphql', cors(corsOptions), checkAuth, (req, res) => {
  const graphqlQuery = graphqlHTTP({
    schema,
    graphiql: true,
  });
  return graphqlQuery(req, res);
});

app.get('/ping', (req, res) => {
  res.status(200).json({ data: 'pong' });
});

app.use(RouterEnrich);
app.use(RouterUpdate);

// elastic index
initalizeIndex();

/* Errors and unknown routes */
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen('8080', () => {
  logger.info('Server listening on 8080');
});

cron.schedule('0 1 * * *', async () => {
  logger.info('deleteEnrichedFile');
  await deleteEnrichedFile();
});

module.exports = app;
