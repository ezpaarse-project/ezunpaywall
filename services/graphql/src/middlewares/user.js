/* eslint-disable no-param-reassign */

const appLogger = require('../lib/logger/appLogger');
const { getClient } = require('../lib/redis/client');

const userPlugin = {
  requestDidStart() {
    return {
      async didResolveOperation(tt) {
        const { request } = tt;
        let apiKey = request.http?.headers.get('x-api-key');

        const redisClient = getClient();

        if (!apiKey) {
          apiKey = request.http?.query.apikey;
          request.http.headers['x-api-key'] = request.http.query.apikey;
        }

        if (!apiKey) {
          throw new Error('Invalid or missing API key');
        }

        let apikeyConfig;
        try {
          apikeyConfig = await redisClient.get(apiKey);
        } catch (err) {
          appLogger.error(`[redis]: Cannot get [${apiKey}]`, err);
          throw new Error('Invalid or missing API key');
        }

        let config;
        try {
          config = JSON.parse(apikeyConfig);
        } catch (err) {
          appLogger.error(`[redis]: Cannot parse [${apikeyConfig}]`, err);
          throw new Error('Invalid or missing API key');
        }

        if (!Array.isArray(config?.access) || !config?.access?.includes('graphql') || !config?.allowed) {
          throw new Error('Invalid or missing API key');
        }

        tt.contextValue.res.req.user = config.name;
      },
    };
  },
};

module.exports = userPlugin;
