const promiseWithTimeout = require('../lib/ping');
const { pingRedis } = require('../services/redis');
const { pingElastic } = require('../services/elastic');

/**
 * Controller to get health of all services connected to graphql service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function health(req, res, next) {
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
}

/**
 * Controller to get health of redis service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function healthRedis(req, res, next) {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');
  return res.status(200).json(resultPing);
}

/**
 * Controller to get health of redis service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
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
