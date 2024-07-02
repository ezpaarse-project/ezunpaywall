const promiseWithTimeout = require('../ping');
const { pingSMTP } = require('../mail');

/**
 * Controller to get health of all services connected to mail service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function health(req, res, next) {
  const start = Date.now();

  const p1 = promiseWithTimeout(pingSMTP(), 'smtp');

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
 * Controller to get health of SMTP service.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function healthSMTP(req, res, next) {
  const resultPing = await promiseWithTimeout(pingSMTP(), 'smtp');
  return res.status(200).json(resultPing);
}

module.exports = {
  health,
  healthSMTP,
};
