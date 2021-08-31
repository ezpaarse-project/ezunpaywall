const redis = require('redis');
const util = require('util');

const config = require('config');

const password = config.get('redisPassword');

const redisClient = redis.createClient({
  host: 'redis',
  port: 6379,
  password,
});

redisClient.get = util.promisify(redisClient.get);

module.exports = redisClient;
