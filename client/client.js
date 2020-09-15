const { Client } = require('@elastic/elasticsearch');

module.exports = new Client({
  node: 'http://es01:9200',
  maxRetries: 5,
  requestTimeout: 60000,
  sniffOnStart: true,
});
