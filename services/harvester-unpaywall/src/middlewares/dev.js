/**
 * dev middleware that checks if NODE_ENV is equal to development
 *
 * @param {import('express').Request} req HTTP request.
 * @param {import('express').Response} res HTTP response.
 * @param {import('express').NextFunction} next Do the following.
 *
 * This middleware need a header that contains the apikey.
 */
async function dev(req, res, next) {
  const env = process.env.NODE_ENV;

  if (env !== 'test' && env !== 'development') {
    return res.status(404).json({ message: 'This route is not available' });
  }

  return next();
}

module.exports = dev;
