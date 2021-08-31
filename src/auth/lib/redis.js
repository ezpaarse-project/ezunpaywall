const redis = require('redis');
const config = require('config');
const fs = require('fs-extra');

const logger = require('./logger');

let apiKeys;
let password;

if (!fs.pathExists('../apikey.json')) {
  logger.warn('No API key are set');
}

if (process.env.NODE_ENV === 'production') {
  password = config.get('redisPassword');
  apiKeys = require('../apikey.json');
} else {
  password = 'changeme';
  apiKeys = require('../apikey-dev.json');
}

const client = redis.createClient({
  host: 'redis',
  port: 6379,
  password,
});

client.on('error', (err) => {
  logger.error(err);
});

const apiKeysJSON = Object.keys(apiKeys);

const load = () => {
  apiKeysJSON.forEach((key) => {
    client.set(key, `${JSON.stringify(apiKeys[key])}`, redis.print);
  });
};

module.exports = load;
