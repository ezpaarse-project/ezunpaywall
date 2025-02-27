/* eslint-disable global-require */
const axios = require('axios');
const config = require('config');

const appLogger = require('../logger/appLogger');

let graphqlService;

if (process.env.NODE_ENV === 'test') {
  const GraphqlMock = require('./mock');
  appLogger.info('[graphql]: Using mock Graphql client for tests.');
  graphqlService = GraphqlMock;
} else {
  graphqlService = axios.create({
    baseURL: config.graphql.url,
  });
  graphqlService.baseURL = config.graphql.url;
}

function getGraphqlClient() { return graphqlService; }

module.exports = getGraphqlClient;
