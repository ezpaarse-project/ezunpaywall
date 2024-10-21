const { apikey } = require('config');

/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 *
 * This middleware need a header that contains the apikey.
 */
async function checkAdmin(req, res, next) {
  const key = req.get('x-api-key');

  if (key !== apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
}

module.exports = checkAdmin;
