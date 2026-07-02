const router = require('express').Router();

const promiseWithTimeout = require('../lib/ping');
const { pingElastic } = require('../lib/elastic');
const { pingUnpaywall } = require('../lib/unpaywall/api');
const { pingSMTP } = require('../lib/mail');
/**
 * Route that give the name of service.
 */
router.get('/', (req, res) => res.status(200).json('ezUNPAYWALL harvester unpaywall API'));

/**
 * Route that ping the service.
 */
router.get('/ping', (req, res) => res.status(204).end());

/**
 * route that gives the status of each services connected to admin service.
 */
router.get('/status', async (req, res, next) => {
  const start = Date.now();
  const p2 = promiseWithTimeout(pingElastic(), 'elastic');
  const p3 = promiseWithTimeout(pingUnpaywall(), 'unpaywall');
  const p4 = promiseWithTimeout(pingSMTP(), 'smtp');

  let resultPing = await Promise.allSettled([p2, p3, p4]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
});

module.exports = router;
