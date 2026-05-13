const request = require('supertest');

const { apikey } = require('config');
const app = require('../../src/app');

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
  let response;
  try {
    response = await request(app)
      .post('/apikeys')
      .send(config)
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][apikey]: Cannot create API key');
    console.error(err);
  }
  return response.body.apikey;
}

/**
 * Delete all API key from redis.
 *
 * @returns {Promise<void>}
 */
async function deleteAll() {
  try {
    await request(app)
      .delete('/apikeys')
      .set('x-api-key', apikey);
  } catch (err) {
    console.error('[test][utils][apikey]: Cannot delete all API key');
    console.error(err);
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
  let response;
  try {
    response = await request(app)
      .get(`/apikeys/${key}`);
  } catch (err) {
    console.error('[test][utils][apikey]: Cannot get API key');
    console.error(err);
  }
  return response.body;
}

module.exports = {
  data,
  create,
  deleteAll,
  get,
};
