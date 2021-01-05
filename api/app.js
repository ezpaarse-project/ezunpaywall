const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');
const morgan = require('morgan');
const fs = require('fs-extra');
const path = require('path');

const schema = require('./graphql/graphql');

// routers
const RouterManageDatabase = require('./updateservice/routers/update');
const RouterOutFiles = require('./updateservice/routers/outFiles');
const RouterTask = require('./updateservice/routers/status');

const { logger } = require('./lib/logger');
const { sendMail, generateMail } = require('./lib/mail');

const outDir = path.resolve(__dirname, 'out');
// initiates all out dir
fs.ensureDir(path.resolve(outDir, 'logs'));
fs.ensureDir(path.resolve(outDir, 'download'));
fs.ensureDir(path.resolve(outDir, 'reports'));

// start server
const app = express();

// middleware
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

app.use('/update', cors());

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

app.use(RouterOutFiles);
app.use(RouterTask);
app.use(RouterManageDatabase);

app.get('/ping', (req, res) => {
  res.status(200).json({ data: 'pong' });
});

const task = {
  example: 'task',
};

const status = 'success';

app.get('/mail', async (req, res) => {
  try {
    await sendMail({
      from: 'ez-unpaywall',
      to: 'leofelixoff@outlook.fr',
      subject: `ez-unpaywall - Rapport de mise à jour - ${status}`,
      ...generateMail('report', {
        task: JSON.stringify(task, null, 2),
        status,
        date: new Date().toISOString().slice(0, 10),
      }),
    });
  } catch (err) {
    console.log(err);
  }
  res.status(200).json({ data: 'pong' });
});

/* Errors and unknown routes */
app.use((req, res) => res.status(404).json({ message: `Cannot ${req.method} ${req.originalUrl}` }));

app.use((error, req, res) => res.status(500).json({ message: error.message }));

app.listen('8080', () => {
  logger.info('Server listening on 8080');
  app.emit('ready');
});

module.exports = app;
