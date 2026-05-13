const { cron } = require('config');

const { getCount } = require('../lib/doi');

const { limit } = cron.doiUpdate;
/**
 * middleware that checks if count is less than 100 000
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 *
 */
async function countDOI(req, res, next) {
  const count = getCount();

  if (count >= limit) {
    return res.status(429).json({ message: 'Limit is reached, try tomorrow' });
  }

  return next();
}

module.exports = countDOI;
