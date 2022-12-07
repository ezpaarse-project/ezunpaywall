const axios = require('axios');
const config = require('config');

const logger = require('../lib/logger');

async function pingWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'time out');
  });

  let res;

  try {
    res = await Promise.race([p1, p2]);
  } catch (err) {
    res = err;
  }

  return {
    name, status: res ?? true, elapsedTime: Date.now() - start,
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
  }
  console.log(res);
  return res.data;
}

async function ping(name, serviceHost) {
  let res;
  try {
    res = await axios({
      method: 'GET',
      url: `${serviceHost}/ping`,
    });
  } catch (err) {
    logger.error(`Cannot request ${name} service at ${serviceHost}/ping`);
  }
  return res.data;
}

async function pingAll() {
  const graphqlHost = config.get('graphql');
  const pingGraphql = pingWithTimeout(ping('graphql', graphqlHost), 'ping graphql', 5000);
  const healthGraphql = pingWithTimeout(health('graphql', graphqlHost), 'health graphql', 5000);

  const updateHost = config.get('update');
  const pingUpdate = pingWithTimeout(ping('update', updateHost), 'ping update', 5000);
  const healthUpdate = pingWithTimeout(health('update', updateHost), 'health update', 5000);

  const enrichHost = config.get('enrich');
  const pingEnrich = pingWithTimeout(ping('enrich', enrichHost), 'ping enrich', 5000);
  const healthEnrich = pingWithTimeout(health('enrich', enrichHost), 'health enrich', 5000);

  const apikeyHost = config.get('apikey');
  const pingApikey = pingWithTimeout(ping('apikey', apikeyHost), 'ping apikey', 5000);
  const healthApikey = pingWithTimeout(health('apikey', apikeyHost), 'health apikey', 5000);

  const mailHost = config.get('mail');
  const pingMail = pingWithTimeout(ping('mail', mailHost), 'ping mail', 5000);
  const healthMail = pingWithTimeout(health('mail', mailHost), 'health mail', 5000);

  const result = await Promise.allSettled([
    pingGraphql,
    healthGraphql,
    pingUpdate,
    healthUpdate,
    pingEnrich,
    healthEnrich,
    pingApikey,
    healthApikey,
    pingMail,
    healthMail,
  ]);

  return result;
}

module.exports = pingAll;
