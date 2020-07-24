const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const morgan = require('morgan');
// const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
// const CronJob = require('cron');

const schema = require('./apiGraphql/graphql');

// routers
const RouterManageDatabase = require('./databaseManagement/routers/databaseInteraction');
const RouterHomePage = require('./databaseManagement/routers/accesToOutFiles');

// postgresql
const db = require('./databaseManagement/settings/sequelize');
// init database
const initTableUPW = require('./databaseManagement/settings/initTableUPW');
const { apiLogger } = require('./logger/logger');

const outDir = path.resolve(__dirname, 'out');
const downloadDir = path.resolve(__dirname, 'out', 'download');
const reportsDir = path.resolve(__dirname, 'out', 'reports');
const statusDir = path.resolve(__dirname, 'out', 'status');

fs.ensureDir(outDir);
fs.ensureDir(downloadDir);
fs.ensureDir(reportsDir);
fs.ensureDir(statusDir);
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

// TODO do a middleware to get time of request
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
app.use('/status', express.static(`${__dirname}/out/status`));
app.use('/logs', express.static(`${__dirname}/out/logs`));

// routers
app.use(RouterHomePage);
app.use(RouterManageDatabase);

// TODO CRON
// const update = new CronJob('* * * * * Wed', () => {
//   axios({
//     method: 'get',
//     url: '/weeklyUpdate',
//   });
// });

// update.start();

/* Errors and unknown routes */
app.all('*', (req, res) => res.status(400).json({ type: 'error', message: 'bad request' }));

app.use((error, req, res) => res.status(500).json({ type: 'error', message: error.message }));

db.authenticate()
  .then(async () => {
    apiLogger.info('Database connected');
    await initTableUPW();
    app.listen(config.get('API_PORT'), () => apiLogger.info(`Server listening on ${config.get('API_PORT')}`));
  })
  .catch((err) => apiLogger.error(`Error: ${err}`));

module.exports = app;
