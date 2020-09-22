const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');

const schema = require('./apiGraphql/graphql');

// routers
const RouterManageDatabase = require('./updateManagement/routers/databaseInteraction');
const RouterHomePage = require('./updateManagement/routers/accesToOutFiles');

const { apiLogger } = require('./logger/logger');

const outDir = path.resolve(__dirname, 'out');
const downloadDir = path.resolve(__dirname, 'out', 'download');
const reportsDir = path.resolve(__dirname, 'out', 'reports');

fs.ensureDir(outDir);
fs.ensureDir(downloadDir);
fs.ensureDir(reportsDir);

const initialSnapShotUnpaywall = path.resolve(downloadDir, 'unpaywall_snapshot.jsonl.gz');
fs.ensureFile(initialSnapShotUnpaywall, (err) => {
  if (err) { apiLogger.info('the initial snapshot of Unpaywall is not installed, check: https://unpaywall-data-snapshots.s3-us-west-2.amazonaws.com/unpaywall_snapshot_2020-04-27T153236.jsonl.gz&sa=D&ust=1592233250776000&usg=AFQjCNHGTZDSmFXIkZW0Fw6y3R7-zPr5bAto install it'); }
});

// start server
const app = express();

// middleware
const isDev = process.env.NODE_ENV === 'development';
if (isDev) app.use(morgan('dev'));
if (!isDev) {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.resolve(__dirname, 'out', 'logs', 'access.log'), { flags: 'a+' }),
  }));
}

// routers
app.get('/', (req, res) => {
  res.sendFile(path.resolve('homepage', 'index.html'));
});
const corsOptions = {
  origin: '*',
  methods: 'GET, POST',
  allowedHeaders: ['Content-Type'],
};

// initialize API graphql
app.use('/graphql', cors(corsOptions), bodyParser.json(), (req, res) => {
  const graphqlQuery = graphqlHTTP({
    schema,
    graphiql: true,
  });
  return graphqlQuery(req, res);
});
// access to file in out
app.use('/reports', express.static(`${__dirname}/out/reports`));
app.use('/logs', express.static(`${__dirname}/out/logs`));

// routers
app.use(RouterHomePage);
app.use(RouterManageDatabase);

/* Errors and unknown routes */
app.all('*', (req, res) => res.status(400).json({ message: 'bad request' }));

app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen('8080', () => apiLogger.info('Server listening on 8080'));

module.exports = app;
