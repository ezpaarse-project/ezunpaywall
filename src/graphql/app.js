const express = require('express');
const cors = require('cors');
const graphqlHTTP = require('express-graphql');

// start server
const app = express();

const { name, version } = require('../../package.json'); 

app.get('/', (req, res) => {
  res.status(200).json({ name, version });
});

// middleware
app.use(cors());