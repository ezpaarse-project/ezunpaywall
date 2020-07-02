const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');
const config = require('config');
const schema = require('./api/graphql');

const port = config.get('API_PORT');
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

// middlewares
app.use(cors());

app.get('/', (req, res) => {
  res.json({
    graphiql: `http://localhost:${port}/graphql`,
    archive: `http://localhost:${port}/firstInitializationWithFileCompressed`,
    update: `http://localhost:${port}/updateDatabase`,
    status: `http://localhost:${port}/databaseStatus`,
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

app.use((error, req, res, next) => res.status(500).json({ type: 'error', code: 500, message: error.message }));

app.listen(port, () => console.log('Graphql server up !'));

module.exports = app;
