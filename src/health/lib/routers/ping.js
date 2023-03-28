const router = require('express').Router();

const pingAll = require('../controllers/ping');

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
router.get('/', (req, res) => res.status(200).json('health service'));

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
 * route that gives the state of health of services
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
