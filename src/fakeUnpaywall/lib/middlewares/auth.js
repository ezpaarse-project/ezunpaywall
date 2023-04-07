/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches default used as password.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 *
 * This middleware need a header that contains the apikey.
 */
async function checkAuth(req, res, next) {
  const { api_key } = req.query;

  if (!api_key) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (api_key !== 'default') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
}

module.exports = checkAuth;
