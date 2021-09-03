const redis = require('redis');
const util = require('util');
const config = require('config');

const redisClient = redis.createClient({
  host: config.get('redis.host'),
  port: config.get('redis.port'),
  password: config.get('redis.password'),
});

redisClient.get = util.promisify(redisClient.get);

module.exports = redisClient;
