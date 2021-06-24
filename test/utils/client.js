const { Client } = require('@elastic/elasticsearch');
const { URL } = require('url');

module.exports = new Client({
  node: {
    url: new URL(`http://localhost:9200`),
    auth: {
      username: 'elastic',
      password: 'changeme',
    },
  },
});
