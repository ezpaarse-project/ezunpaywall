const axios = require('axios');
const config = require('config');
const redis = require('redis');

const logger = require('../lib/logger');

async function PromiseOnHealthWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, new Error('time out'));
  });

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    logger.error(`[${name}] ${err}`);
    return {
      name, elapsedTime: Date.now() - start, error: err?.message, healthy: false,
    };
  }

  const services = { ...reply };

  delete services.elapsedTime;
  delete services.healthy;

  return {
    name, elapsedTime: Date.now() - start, services, healthy: reply.healthy || false,
  };
}

async function health(name, host) {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${host}/health`,
    });
  } catch (err) {
    logger.error(`Cannot request ${name} service at ${host}/health`);
    return false;
  }
  return res.data;
}

async function promiseWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, new Error('time out'));
  });

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    logger.error(`[${name}] ${err}`);
    return {
      name, elapsedTime: Date.now() - start, error: err?.message, healthy: false,
    };
  }

  let error;
  let healthy = true;

  if (reply !== true) {
    error = reply;
    healthy = false;
  }

  return {
    name, elapsedTime: Date.now() - start, error, healthy,
  };
}

async function ping(name, host) {
  try {
    await axios({
      method: 'GET',
      url: `${host}`,
    });
  } catch (err) {
    logger.error(`Cannot request ${name} service at ${host}`);
    return err?.message;
  }
  return true;
}

async function pingRedisWithClient() {
  const redisClient = redis.createClient({
    host: config.get('redis.host'),
    port: config.get('redis.port'),
    password: config.get('redis.password'),
  });

  try {
    await redisClient.ping();
  } catch (err) {
    logger.error(`Cannot ping ${config.get('redis.host')}:${config.get('redis.port')}`);
    return err?.message;
  }
  return true;
}

async function pingAll() {
  const graphqlHost = config.get('graphqlHost');
  const healthGraphql = PromiseOnHealthWithTimeout(health('graphql', graphqlHost), 'graphql', 5000);

  const updateHost = config.get('updateHost');
  const healthUpdate = PromiseOnHealthWithTimeout(health('update', updateHost), 'update', 5000);

  const enrichHost = config.get('enrichHost');
  const healthEnrich = PromiseOnHealthWithTimeout(health('enrich', enrichHost), 'enrich', 5000);

  const apikeyHost = config.get('apikeyHost');
  const healthApikey = PromiseOnHealthWithTimeout(health('apikey', apikeyHost), 'apikey', 5000);

  const mailHost = config.get('mailHost');
  const healthMail = PromiseOnHealthWithTimeout(health('mail', mailHost), 'mail', 5000);

  const elasticHost = config.get('elasticHost');
  const pingElastic = promiseWithTimeout(ping('elastic', elasticHost), 'elastic', 5000);

  const unpaywallHost = config.get('unpaywall.host');
  const pingUnpaywall = promiseWithTimeout(ping('unpaywall', unpaywallHost), 'unpaywall', 5000);

  const pingRedis = promiseWithTimeout(pingRedisWithClient(), 'redis', 5000);

  const result = await Promise.allSettled([
    healthGraphql,
    healthUpdate,
    healthEnrich,
    healthApikey,
    healthMail,
    pingElastic,
    pingUnpaywall,
    pingRedis,
  ]);

  return result;
}

module.exports = pingAll;
