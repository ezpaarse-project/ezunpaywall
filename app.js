const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./api/graphql');

// routers
const RouterManageDatabase = require('./routers/routerManageDatabase');

// postgresql
const db = require('./database/database');
// init database
const initTableUPW = require('./database/initTableUPW');

// test connexion with sequelize
db.authenticate()
  .then(() => console.log('Database connected'))
  .catch((err) => console.log(`Error: ${err}`));

// create if not exists table
initTableUPW();

// start server
const app = express();

app.get('/', (req, res) => {
  res.json({
    graphiql: 'http://localhost:8080/graphql',
    archive: 'http://localhost:8080/firstInitializationWithFileCompressed',
    update: 'http://localhost:8080/updateDatabase',
    status: 'http://localhost:8080/databaseStatus',
  });
});

app.use(RouterManageDatabase);

// start graphql
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));

/* Errors and unknown routes */
app.all('*', (req, res) => res.status(400).json({ type: 'error', code: 400, message: 'bad request' }));

app.use((error, req, res, next) => {
  console.log(error);
  return res.status(500).json({ type: 'error', code: 500, message: error.message });
});

app.listen(8080, () => console.log('Graphql server up !'));

module.exports = app;
