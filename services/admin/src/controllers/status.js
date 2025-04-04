const promiseWithTimeout = require('../lib/ping');
const { pingRedis } = require('../lib/redis');
const { pingElastic } = require('../lib/elastic');
const { pingUnpaywall } = require('../lib/unpaywall/api');
const { pingSMTP } = require('../lib/mail');

/**
 * Controller to get status of all services connected to apikey service.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function statusController(req, res, next) {
  const start = Date.now();
  const p1 = promiseWithTimeout(pingRedis(), 'redis');
  const p2 = promiseWithTimeout(pingElastic(), 'elastic');
  const p3 = promiseWithTimeout(pingUnpaywall(), 'unpaywall');
  const p4 = promiseWithTimeout(pingSMTP(), 'smtp');

  let resultPing = await Promise.allSettled([p1, p2, p3, p4]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
}

module.exports = statusController;
