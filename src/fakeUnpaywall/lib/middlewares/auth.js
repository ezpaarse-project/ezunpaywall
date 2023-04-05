/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches default used as password.
 *
 * @param {import('express').Request} req - HTTP request.
 * @param {import('express').Response} res - HTTP response.
 * @param {import('express').NextFunction} next - Do the following.
 *
 * Do the following in route or in error handler.
 */
const checkAuth = async (req, res, next) => {
  // TODO check in query
  const { api_key } = req.query;

  if (!api_key) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  if (api_key !== 'default') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  return next();
};

module.exports = checkAuth;
