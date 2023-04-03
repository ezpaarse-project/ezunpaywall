const router = require('express').Router();

const promiseWithTimeout = require('../controllers/ping');
const { pingRedis } = require('../services/redis');
const { pingElastic } = require('../services/elastic');

/**
 * Route that give the name of service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {string} name of service.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/', (req, res) => res.status(200).json('graphql service'));

/**
 * Route that ping the service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/ping', (req, res) => res.status(204).end());

/**
 * route that gives the state of health of the service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Array<Object>} List of status of healthcheck
 * with name, time, optionnal error and healthy.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/health', async (req, res) => {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingRedis(), 'redis');
  const p2 = promiseWithTimeout(pingElastic(), 'elastic');

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
 * route that gives the state of health of the redis.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Array<Object>} List of status of healthcheck
 * with name, time, optionnal error and healthy.
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/health/redis', async (req, res) => {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');

  return res.status(200).json(resultPing);
});

/**
 * route that gives the state of health of elastic.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 *
 * @routeResponse {Object} status of healthcheck
 * with name, time, optionnal error and healthy
 *
 * @return {import('express').Response} HTTP response.
 */
router.get('/health/elastic', async (req, res) => {
  const resultPing = await promiseWithTimeout(pingElastic(), 'elastic');

  return res.status(200).json(resultPing);
});

module.exports = router;
