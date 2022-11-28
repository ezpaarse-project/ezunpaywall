const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const logger = require('../lib/logger');

const configPath = path.resolve(__dirname, '..', 'config.json');

async function ping(url, method, timeout) {
  try {
    await axios({
      method,
      url,
      timeout,
    });
  } catch (err) {
    logger.error(err);
    return false;
  }
  logger.info('OK');
  return true;
}

async function pingAll() {
  let servers = await fs.readFile(configPath, 'utf8');
  servers = JSON.parse(servers);

  Promise.all(
    servers.forEach((server) => {
      const { services } = server;
      Promise.all(
        services.forEach((service) => ping(service.url, service.method, service.timeout)),
      );
      return ping(server.url, server.method, server.timeout);
    }),
  );
}

module.exports = pingAll;
