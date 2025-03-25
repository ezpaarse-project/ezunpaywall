const { getClient } = require('../../src/lib/redis/client');

const data = {
  apikey1: {
    name: 'test-user1',
    owner: 'test',
    description: 'created by test program',
    access: ['graphql', 'enrich'],
    attributes: ['*'],
    allowed: true,
  },
  apikey2: {
    name: 'test-user2',
    owner: 'test',
    description: 'Created by test program',
    access: ['graphql'],
    attributes: ['*'],
    allowed: true,
  },
  apikey3: {
    name: 'test-user3',
    owner: 'test',
    description: 'Created by test program',
    access: ['graphql', 'enrich'],
    attributes: ['doi'],
    allowed: false,
  },
  apikey4: {
    name: 'test-user4',
    owner: 'test',
    description: 'Created by test program',
    access: ['enrich'],
    attributes: ['doi, is_oa'],
    allowed: true,
  },
};

/**
 * Load dev API keys
 */
async function loadApikey() {
  const redisClient = getClient();
  await redisClient.set('apikey1', `${JSON.stringify(data.apikey1)}`);
  await redisClient.set('apikey2', `${JSON.stringify(data.apikey2)}`);
  await redisClient.set('apikey3', `${JSON.stringify(data.apikey3)}`);
  await redisClient.set('apikey4', `${JSON.stringify(data.apikey4)}`);
}

/**
 * Delete all API key from redis.
 *
 * @returns {Promise<void>}
 */
async function deleteAll() {
  const redisClient = getClient();
  await redisClient.flushall();
}

module.exports = {
  loadApikey,
  deleteAll,
};
