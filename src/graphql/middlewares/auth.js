const redisClient = require('../lib/redis');

/**
 * check the user's api key
 * @param {Object} req - HTTP request
 * @param {Object} res - HTTP response
 * @param {function} next - do the following
 * @returns {Object|function} res or next
 */
const checkAuth = async (req, res, next) => {
  // TODO check in query
  const apikey = req.get('X-API-KEY');

  if (!apikey) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const key = await redisClient.get(apikey);
  const config = JSON.parse(key);
  console.log(apikey);
  console.log('=========');
  console.log(key);

  if (!config) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!config.access.includes('graphql')) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  if (!config.allowed) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  return next();
};

module.exports = {
  checkAuth,
};
