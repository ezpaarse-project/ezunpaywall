const router = require('express').Router();

const pingAll = require('../controllers/ping');

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
router.get('/', (req, res) => res.status(200).json('health service'));

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
 * route that gives the state of health of services
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
  let resultPing = await pingAll();
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = {
      elapsedTime: e?.elapsedTime,
      services: e?.services,
      error: e?.error,
      healthy: e?.healthy,
    };
  });

  return res.status(200).json(result);
});

module.exports = router;
