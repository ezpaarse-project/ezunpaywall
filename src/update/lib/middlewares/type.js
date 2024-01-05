/**
 * Joi middleware to check if interval in body is correct.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 */
async function updateType(req, res, next) {
  let type = 'unpaywall';

  if (req.originalUrl.split('/').includes('history')) {
    type = 'unpaywallHistory';
  }

  if (!req.data) {
    req.data = {};
  }

  req.data.type = type;

  return next();
}

module.exports = updateType;
