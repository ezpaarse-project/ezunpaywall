const express = require('express');
const bodyParser = require('body-parser');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const config = require('config');
const CronJob = require('cron');

const schema = require('./api/graphql/graphql');

// routers
const RouterManageDatabase = require('./api/routers/manageDatabase');

// postgresql
const db = require('./database/database');
// init database
const initTableUPW = require('./database/initTableUPW');

const downloadDir = path.resolve(__dirname, 'download');
fs.ensureDir(downloadDir);
const initialSnapShotUnpaywall = path.resolve(__dirname, 'download', 'unpaywall_snapshot.jsonl.gz');
fs.ensureFile(initialSnapShotUnpaywall, (err) => {
  if (err) { console.log('the initial snapshot of Unpaywall is not installed, check: https://www.google.com/url?q=https://unpaywall-data-snapshots.s3-us-west-2.amazonaws.com/unpaywall_snapshot_2020-04-27T153236.jsonl.gz&sa=D&ust=1592233250776000&usg=AFQjCNHGTZDSmFXIkZW0Fw6y3R7-zPr5bAto install it'); }
});

// test connexion with sequelize
db.authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(`Error: ${err}`));

// create if not exists table
initTableUPW();

// start server
const app = express();

const corsOptions = {
  origin: '*',
  methods: 'GET, POST',
  allowedHeaders: ['Content-Type'],
};

// start graphql
app.use('/graphql', cors(corsOptions), bodyParser.json(), graphqlHTTP({
  schema,
  graphiql: true,
}));

app.get('/', (req, res) => {
  res.json({
    graphiql: `http://localhost:${config.get('API_PORT')}/graphql`,
    archive: `http://localhost:${config.get('API_PORT')}/action/init?offset=100&limit=1000`,
    update: `http://localhost:${config.get('API_PORT')}/action/update`,
    status: `http://localhost:${config.get('API_PORT')}/database/status`,
    downloadUpdate: `http://localhost:${config.get('API_PORT')}/update/download`,
    processStatus: `http://localhost:${config.get('API_PORT')}/process/status`,
  });
});

// routers
app.use(RouterManageDatabase);

// TODO CRON
// const update = new CronJob('* * * * * Wed', () => {
//   axios({
//     method: 'get',
//     url: `http://localhost:${config.get('API_PORT')}/downloadUpdate`,
//   });
// });

// update.start();


/* Errors and unknown routes */
app.all('*', (req, res) => res.status(400).json({ type: 'error', code: 400, message: 'bad request' }));

app.use((error, req, res, next) => res.status(500).json({ type: 'error', code: 500, message: error.message }));

app.listen(config.get('API_PORT'), () => console.log('Graphql server up !'));

module.exports = app;
