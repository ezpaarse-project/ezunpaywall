const promiseWithTimeout = require('../ping');
const { pingElastic } = require('../services/elastic');
const { pingMail } = require('../services/mail');
const { pingUnpaywall } = require('../services/unpaywall');

/**
 * Controller to get health of all services connected to update service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function health(req, res, next) {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingElastic(), 'elastic');
  const p2 = promiseWithTimeout(pingMail(), 'mail');
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
 * Controller to get health of elastic.
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
  healthElastic,
};
