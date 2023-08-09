const healthAll = require('../health');

/**
 * Controller to get health of all services of ezunpaywall.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function health(req, res, next) {
  let resultPing = await healthAll();
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
}

module.exports = health;
