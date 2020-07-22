const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const morgan = require('morgan');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const CronJob = require('cron');

const schema = require('./api/graphql/graphql');

// routers
const RouterManageDatabase = require('./api/routers/manageDatabase');
const RouterHomePage = require('./api/routers/homepage');

// postgresql
const db = require('./database/database');
// init database
const initTableUPW = require('./database/initTableUPW');
const { apiLogger } = require('./api/services/logger');

const downloadDir = path.resolve(__dirname, 'download');
fs.ensureDir(downloadDir);
const reportsDir = path.resolve(__dirname, 'reports');
fs.ensureDir(reportsDir);
const initialSnapShotUnpaywall = path.resolve(__dirname, 'download', 'unpaywall_snapshot.jsonl.gz');
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
    stream: fs.createWriteStream(path.resolve(__dirname, 'logs', 'access.log'), { flags: 'a+' }),
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
// start graphql
// TODO do a middleware to get time of request
app.use('/graphql', cors(corsOptions), bodyParser.json(), (req, res) => {
  const graphqlQuery = graphqlHTTP({
    schema,
    graphiql: true,
  });
  return graphqlQuery(req, res);
});
app.use(RouterHomePage);
app.use('/reports', express.static(`${__dirname}/reports`));
app.use('/status', express.static(`${__dirname}/status`));
app.use(RouterManageDatabase);

// TODO CRON
// const update = new CronJob('* * * * * Wed', () => {
//   axios({
//     method: 'get',
//     url: '/downloadUpdate',
//   });
// });

// update.start();

/* Errors and unknown routes */
app.all('*', (req, res) => res.status(400).json({ type: 'error', message: 'bad request' }));

app.use((error, req, res, next) => res.status(500).json({ type: 'error', message: error.message }));

db.authenticate()
  .then(async () => {
    apiLogger.info('Database connected');
    await initTableUPW();
    app.listen(config.get('API_PORT'), () => apiLogger.info(`Server listening on ${config.get('API_PORT')}`));
  })
  .catch((err) => apiLogger.error(`Error: ${err}`));

module.exports = app;
