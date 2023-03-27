const axios = require('axios');
const config = require('config');

const logger = require('../logger');

const pingRedisWithClient = require('../services/redis');
const pingElasticWithClient = require('../services/elastic');

const healthTimeout = config.get('healthTimeout');

/**
 * Executes a promise but cuts it off after a while if it has not been resolved.
 * this function is used for healthcheck routes.
 *
 * @param {Promise} p1 - Promise to be executed which will be stopped
 * if it does not solve after a certain time.
 * @param {String} name - Name of service.
 *
 * @returns {Object} Status of healthcheck with name, time, optionnal error and healthy.
 */
async function PromiseOnHealthWithTimeout(p1, name) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, healthTimeout, new Error('time out'));
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

/**
 * Get health of serivce.
 *
 * @param {String} name - Name of service.
 * @param {String} host - Host of service.
 *
 * @returns {Object} Status of healthcheck with name, time, optionnal error and healthy.
 */
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

/**
 * Executes a promise but cuts it off after a while if it has not been resolved.
 * This function is used for healthcheck routes.
 *
 * @param {*} p1 - Promise to be executed which will be stopped
 * if it does not solve after a certain time.
 * @param {*} name - Name of service
 *
 * @returns {Object} Status of healthcheck with name, time, optionnal error and healthy.
 */
async function promiseWithTimeout(p1, name) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, healthTimeout, new Error('time out'));
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

/**
 * Ping service.
 *
 * @param {String} name - Name of service.
 * @param {String} host - Host of service.
 *
 * @returns {Boolean} ping
 */
async function ping(name, host) {
  try {
    await axios({
      method: 'GET',
      url: `${host}`,
    });
  } catch (err) {
    logger.error(`Cannot request ${name} service at ${host}`);
    return false;
  }
  return true;
}

/**
 * Health and ping all service on ezunpaywall.
 *
 * @returns {Object} Sist of status of healthcheck with name, time, optionnal error and healthy
 * for each service.
 */
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
