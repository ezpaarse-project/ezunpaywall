const axios = require('axios');
const config = require('config');

const logger = require('../logger');

const pingRedisWithClient = require('../services/redis');
const pingElasticWithClient = require('../services/elastic');

const healthTimeout = config.get('healthTimeout');
async function PromiseOnHealthWithTimeout(p1, name) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, healthTimeout, new Error('time out'));
  });

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    logger.error(`[${name}]`, err);
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
    logger.error(`[${name}] Cannot request ${host}/health`, err);
    return false;
  }
  return res.data;
}

async function promiseWithTimeout(p1, name) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, healthTimeout, new Error('time out'));
  });

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    logger.error(`[${name}]`, err);
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
      url: host,
    });
  } catch (err) {
    logger.error(`[${name}] Cannot request ${host}`, err);
    return err?.message;
  }
  return true;
}

async function pingAll() {
  const graphqlHost = config.get('graphqlHost');
  const healthGraphql = PromiseOnHealthWithTimeout(health('graphql', graphqlHost), 'graphql');

  const updateHost = config.get('updateHost');
  const healthUpdate = PromiseOnHealthWithTimeout(health('update', updateHost), 'update');

  const enrichHost = config.get('enrichHost');
  const healthEnrich = PromiseOnHealthWithTimeout(health('enrich', enrichHost), 'enrich');

  const apikeyHost = config.get('apikeyHost');
  const healthApikey = PromiseOnHealthWithTimeout(health('apikey', apikeyHost), 'apikey');

  const mailHost = config.get('mailHost');
  const healthMail = PromiseOnHealthWithTimeout(health('mail', mailHost), 'mail');

  const pingElastic = promiseWithTimeout(pingElasticWithClient(), 'elastic');

  const unpaywallHost = config.get('unpaywall.host');
  const pingUnpaywall = promiseWithTimeout(ping('unpaywall', unpaywallHost), 'unpaywall');

  const pingRedis = promiseWithTimeout(pingRedisWithClient(), 'redis');

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
