const router = require('express').Router();

const promiseWithTimeout = require('../controllers/ping');
const { pingRedis } = require('../services/redis');
const { pingGraphql } = require('../services/graphql');

/**
 * Route that give the name of service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {String} name of service.
 *
 * @returns {Object} HTTP response.
 */
router.get('/', (req, res) => res.status(200).json('enrich service'));

/**
 * Route that ping the service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response.
 */
router.get('/ping', (req, res, next) => res.status(204).end());

/**
 * route that gives the state of health of the service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {Array<Object>} List of status of healthcheck
 * with name, time, optionnal error and healthy.
 *
 * @returns {Object} HTTP response.
 */
router.get('/health', async (req, res, next) => {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingRedis(), 'redis');
  const p2 = promiseWithTimeout(pingGraphql(), 'graphql');

  let resultPing = await Promise.allSettled([p1, p2]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
});

/**
 * Route that gives the state of health of redis.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {Object} status of healthcheck
 * with name, time, optionnal error and healthy.
 *
 * @returns {Object} HTTP response.
 */
router.get('/health/redis', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');

  return res.status(200).json(resultPing);
});

/**
 * Route that gives the state of health of graphql.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {Object} status of healthcheck
 * with name, time, optionnal error and healthy.
 *
 * @returns {Object} HTTP response.
 */
router.get('/health/graphql', async (req, res, next) => {
  const resultPing = await promiseWithTimeout(pingGraphql(), 'graphql');

  return res.status(200).json(resultPing);
});

module.exports = router;
