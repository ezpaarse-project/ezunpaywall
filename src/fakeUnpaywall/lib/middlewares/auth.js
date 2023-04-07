/**
 * Authentication middleware that checks if the content of the x-api-key header
 * matches default used as password.
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
