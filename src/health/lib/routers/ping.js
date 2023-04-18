const router = require('express').Router();

const pingAll = require('../controllers/ping');

/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('health service'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res) => res.status(204).end());

/**
 * route that gives the state of health of services
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
