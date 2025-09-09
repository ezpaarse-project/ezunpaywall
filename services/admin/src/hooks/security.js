/* eslint-disable no-param-reassign */
const admin = require('../plugins/admin');

function registerSecurityHook(fastify) {
  fastify.addHook('onRoute', (routeOptions) => {
    const preHandlers = (() => {
      if (!routeOptions.preHandler) return [];
      return Array.isArray(routeOptions.preHandler)
        ? routeOptions.preHandler : [routeOptions.preHandler];
    })();

    const hasAdmin = preHandlers.includes(admin);

    if (!routeOptions.schema) {
      routeOptions.schema = {};
    }

    routeOptions.schema.security = hasAdmin ? [{ adminApiKey: [] }] : [];
  });
}

module.exports = registerSecurityHook;
