const axios = require('axios');
const config = require('config');

const logger = require('../lib/logger');

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

  const services = { ...reply };

  delete services.elapsedTime;
  delete services.status;

  return {
    name, elapsedTime: Date.now() - start, services, status: reply.status || false,
  };
}

async function health(name, service) {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${service}/health`,
    });
  } catch (err) {
    logger.error(`Cannot request ${name} service at ${service}/health`);
    return false;
  }
  return res.data;
}

async function pingAll() {
  const graphqlHost = config.get('graphql');
  const healthGraphql = pingWithTimeout(health('graphql', graphqlHost), 'graphql', 5000);

  const updateHost = config.get('update');
  const healthUpdate = pingWithTimeout(health('update', updateHost), 'update', 5000);

  const enrichHost = config.get('enrich');
  const healthEnrich = pingWithTimeout(health('enrich', enrichHost), 'enrich', 5000);

  const apikeyHost = config.get('apikey');
  const healthApikey = pingWithTimeout(health('apikey', apikeyHost), 'apikey', 5000);

  const mailHost = config.get('mail');
  const healthMail = pingWithTimeout(health('mail', mailHost), 'mail', 5000);

  // TODO elastic

  // TODO redis

  // TODO unpaywall

  const result = await Promise.allSettled([
    healthGraphql,
    healthUpdate,
    healthEnrich,
    healthApikey,
    healthMail,
  ]);

  return result;
}

module.exports = pingAll;
