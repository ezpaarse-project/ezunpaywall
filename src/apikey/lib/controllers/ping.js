const promiseWithTimeout = require('../ping');
const { pingRedis } = require('../services/redis');

/**
 * Controller to get config of apikey.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function health(req, res, next) {
  const start = Date.now();
  const p1 = promiseWithTimeout(pingRedis(), 'redis');

  let resultPing = await Promise.allSettled([p1]);
  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, healthy: e?.healthy, error: e?.error };
  });

  const healthy = resultPing.every((e) => e?.healthy);

  return res.status(200).json({ ...result, elapsedTime: Date.now() - start, healthy });
}

/**
 * Controller to get config of apikey.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function healthRedis(req, res, next) {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');
  return res.status(200).json(resultPing);
}

module.exports = {
  health,
  healthRedis,
};
