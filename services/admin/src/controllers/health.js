const promiseWithTimeout = require('../lib/ping');
const { pingRedis } = require('../lib/redis');
const { pingElastic } = require('../lib/elastic');
const { pingUnpaywall } = require('../lib/unpaywall/api');

/**
 * Controller to get health of all services connected to apikey service.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function health(req, res, next) {
  const start = Date.now();
  const p1 = promiseWithTimeout(pingRedis(), 'redis');
  const p2 = promiseWithTimeout(pingElastic(), 'elastic');
  const p3 = promiseWithTimeout(pingUnpaywall(), 'unpaywall');

  let resultPing = await Promise.allSettled([p1, p2, p3]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
}

/**
 * Controller to get health of redis service.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function healthRedis(req, res, next) {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');
  return res.status(200).json(resultPing);
}

/**
 * Controller to get health of elastic.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function healthElastic(req, res, next) {
  const resultPing = await promiseWithTimeout(pingElastic(), 'elastic');

  return res.status(200).json(resultPing);
}

module.exports = {
  health,
  healthRedis,
  healthElastic,
};
