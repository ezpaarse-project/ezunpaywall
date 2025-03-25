/* eslint-disable global-require */
const axios = require('axios');
const config = require('config');

const appLogger = require('../logger/appLogger');

let unpaywall;

if (process.env.NODE_ENV === 'test') {
  const unpaywallMock = require('./mock');
  appLogger.info('[unpaywall]: Using mock Unpaywall client for tests.');
  unpaywall = unpaywallMock;
} else {
  unpaywall = axios.create({
    baseURL: config.unpaywall.url,
  });
  unpaywall.baseURL = config.unpaywall.url;
}

function getUnpaywallClient() { return unpaywall; }

module.exports = getUnpaywallClient;
