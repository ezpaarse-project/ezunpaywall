const axios = require('axios');
const config = require('config');

const unpaywall = axios.create({
  baseURL: config.get('unpaywall.host'),
});
unpaywall.baseURL = config.get('unpaywall.host');

module.exports = unpaywall;
