const promiseWithTimeout = require('../lib/ping');
const { pingRedis } = require('../lib/redis');
const { pingGraphql } = require('../lib/graphql/api');

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
  const p2 = promiseWithTimeout(pingGraphql(), 'graphql');

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
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function healthRedis(req, res, next) {
  const resultPing = await promiseWithTimeout(pingRedis(), 'redis');

  return res.status(200).json(resultPing);
}

/**
 * Controller to get health of graphql service.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 */
async function healthGraphql(req, res, next) {
  const resultPing = await promiseWithTimeout(pingGraphql(), 'graphql');

  return res.status(200).json(resultPing);
}

module.exports = {
  health,
  healthRedis,
  healthGraphql,
};
