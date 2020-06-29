const express = require('express');
const graphqlHTTP = require('express-graphql');

// graphql
const schema = require('./api/graphql');
// postgresql
const db = require('./database/database');
// init database
const initTableUPW = require('./database/initTableUPW');

// test connexion with sequelize
db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch((err) => console.log(`Error: ${err}`));

// create if not exists table
initTableUPW();

// server
const app = express();
app.get('/', (req, res) => {
  res.json({
    graphiql: 'http://localhost:8080/graphql',
    archive: 'http://localhost:8080/insertWithArchive',
    JSONL: 'http://localhost:8080/insertWithJSONL',
    status: 'http://localhost:8080/status',
    update: 'http://localhost:8080/updateViaSnapShot',
  });
});

// root
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

const insertArchive = require('./scriptStreamCompressed');

app.get('/insertWithArchive', (req, res) => {
  insertArchive();
  res.json({ name: 'insert with Bulk ...' });
});

const insertJSONL = require('./scriptStreamDecompressed');

app.get('/insertWithJSONL', (req, res) => {
  insertJSONL();
  res.json({ name: 'insert with Bulk ...' });
});

const update = require('./scriptUpdate');

app.get('/updateViaSnapShot', (req, res) => {
  update();
  res.json({ name: 'update with Bulk...' });
});

const status = require('./scriptDatabaseStatus');

app.get('/status', (req, res) => {
  status().then((result) => {
    res.json({ result });
  });
});

app.listen(8080, () => console.log('now listennig for requests on port 8080'));

module.exports = app;
