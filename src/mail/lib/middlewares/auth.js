const { apikey } = require('config');

/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches the environment variable used as password.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 *
 * @return {import('express').Response | import('express').NextFunction}
 * Do the following in route or in error handler.
 */
const checkAuth = (req, res, next) => {
  const key = req.get('x-api-key');

  if (key !== apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = checkAuth;
