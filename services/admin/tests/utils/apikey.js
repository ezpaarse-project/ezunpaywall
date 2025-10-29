const { apikey } = require('config');
const buildApp = require('../../src/app');

let appInstance;

async function getApp() {
  if (!appInstance) {
    appInstance = await buildApp();
    await appInstance.ready();
  }
  return appInstance;
}

const data = {
  apikey1: {
    name: 'test-user1',
    owner: 'test',
    description: 'created by test program',
    access: ['graphql'],
    attributes: ['*'],
    allowed: true,
  },
  apikey2: {
    name: 'test-user2',
    owner: 'test',
    description: 'Created by test program',
    access: ['graphql', 'enrich'],
    attributes: ['*'],
    allowed: true,
  },
};

/**
 * Create API key
 *
 * @param {Object} config Config of API key.
 *
 * @returns key of API key
 */
async function create(config) {
  try {
    const app = await getApp();
    const response = await app.inject({
      method: 'POST',
      url: '/apikeys',
      payload: config,
      headers: { 'x-api-key': apikey },
    });
    const body = response.json();
    return body.apikey;
  } catch (err) {
    console.error('[test][utils][apikey]: Cannot create API key', err);
  }
}

/**
 * Delete all API key from redis.
 *
 * @returns {Promise<void>}
 */
async function deleteAll() {
  try {
    const app = await getApp();
    await app.inject({
      method: 'DELETE',
      url: '/apikeys',
      headers: { 'x-api-key': apikey },
    });
  } catch (err) {
    console.error('[test][utils][apikey]: Cannot delete all API key', err);
  }
}

/**
 * Get API key
 *
 * @param {string} key API key.
 *
 * @returns config of API key
 */
async function get(key) {
  try {
    const app = await getApp();
    const response = await app.inject({
      method: 'GET',
      url: `/apikeys/${key}`,
      headers: { 'x-api-key': apikey },
    });
    return response.json();
  } catch (err) {
    console.error('[test][utils][apikey]: Cannot get API key', err);
  }
}

module.exports = {
  data,
  create,
  deleteAll,
  get,
};
