const axios = require('axios');
const config = require('config');
const redis = require('redis');

const logger = require('../lib/logger');

async function healthWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, new Error('time out'));
  });

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    return {
      name, elapsedTime: Date.now() - start, error: err?.message, status: false,
    };
  }

  const services = { ...reply };

  delete services.elapsedTime;
  delete services.status;

  return {
    name, elapsedTime: Date.now() - start, services, status: reply.status || false,
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

async function pingWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, new Error('time out'));
  });

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    return {
      name, elapsedTime: Date.now() - start, error: err?.message, status: false,
    };
  }

  let error;
  let status = true;

  if (reply !== true) {
    error = reply;
    status = false;
  }

  return {
    name, elapsedTime: Date.now() - start, error, status,
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
  const graphqlHost = config.get('graphql');
  const healthGraphql = healthWithTimeout(health('graphql', graphqlHost), 'graphql', 5000);

  const updateHost = config.get('update');
  const healthUpdate = healthWithTimeout(health('update', updateHost), 'update', 5000);

  const enrichHost = config.get('enrich');
  const healthEnrich = healthWithTimeout(health('enrich', enrichHost), 'enrich', 5000);

  const apikeyHost = config.get('apikey');
  const healthApikey = healthWithTimeout(health('apikey', apikeyHost), 'apikey', 5000);

  const mailHost = config.get('mail');
  const healthMail = healthWithTimeout(health('mail', mailHost), 'mail', 5000);

  const elasticHost = config.get('elastic');
  const pingElastic = pingWithTimeout(ping('elastic', elasticHost), 'elastic', 5000);

  const unpaywallHost = config.get('unpaywall.host');
  const pingUnpaywall = pingWithTimeout(ping('unpaywall', unpaywallHost), 'unpaywall', 5000);

  const pingRedis = pingWithTimeout(pingRedisWithClient(), 'redis', 5000);

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
