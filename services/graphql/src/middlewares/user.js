/* eslint-disable no-param-reassign */

const appLogger = require('../lib/logger/appLogger');
const { getClient } = require('../lib/redis/client');

const userPlugin = {
  requestDidStart() {
    return {
      async didResolveOperation(context) {
        const { request } = context;
        const apiKey = request.http?.headers.get('x-api-key');

        if (!apiKey) {
          return;
        }

        const redisClient = getClient();

        let apikeyConfig;
        try {
          apikeyConfig = await redisClient.get(apiKey);
        } catch (err) {
          appLogger.error(`[redis]: Cannot get [${apiKey}]`, err);
          return;
        }

        let config;
        try {
          config = JSON.parse(apikeyConfig);
        } catch (err) {
          appLogger.error(`[redis]: Cannot parse [${apikeyConfig}]`, err);
          return;
        }

        context.contextValue.res.req.user = config?.name;
      },
    };
  },
};

module.exports = userPlugin;
