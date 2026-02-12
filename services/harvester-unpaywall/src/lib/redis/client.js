const { redis } = require('config');

const appLogger = require('../logger/appLogger');

const Redis = process.env.NODE_ENV === 'test'
  ? require('ioredis-mock')
  : require('ioredis');

let redisClient;

function getClient() {
  return redisClient;
}

function initClient() {
  if (process.env.NODE_ENV === 'test') {
    appLogger.info('[Redis]: Using ioredis-mock Client for tests.');
  }
  try {
    redisClient = new Redis({
      host: redis.host,
      port: redis.port,
      password: redis.password,
    });
    appLogger.info('[redis]: client is created');
  } catch (err) {
    appLogger.error(`[redis]: Cannot create redis client - ${err}`);
    throw err;
  }

  redisClient.on('connect', () => {
    appLogger.info('[redis]: redis is connected');
  });

  redisClient.on('ready', () => {
    appLogger.info('[redis]: redis is ready');
  });

  redisClient.on('error', (err) => {
    appLogger.error(`[redis]: redis error [${err}]`);
  });

  redisClient.on('reconnecting', () => {
    appLogger.error('[redis]: reconnecting');
  });
}

module.exports = {
  getClient,
  initClient,
};
