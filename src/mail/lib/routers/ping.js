const router = require('express').Router();

const promiseWithTimeout = require('../controllers/ping');

const { pingSMTP } = require('../mail');

/**
 * Route that give the name of service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {String} name of service
 *
 * @returns {Object} HTTP response.
 */
router.get('/', (req, res) => res.status(200).json('mail service'));

/**
 * Route that ping the service.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @returns {Object} HTTP response.
 */
router.get('/ping', (req, res) => res.status(204).end());

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
router.get('/health', async (req, res) => {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingSMTP(), 'smtp');

  let resultPing = await Promise.allSettled([p1]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
});

/**
 * Route that gives the state of health of smtp.
 *
 * @param {Object} req - HTTP request.
 * @param {Object} res - HTTP response.
 *
 * @routeResponse {Object} status of healthcheck.
 * with name, time, optionnal error and healthy.
 *
 * @returns {Object} HTTP response.
 */
router.get('/health/smtp', async (req, res) => {
  const resultPing = await promiseWithTimeout(pingSMTP(), 'smtp');

  return res.status(200).json(resultPing);
});

module.exports = router;
