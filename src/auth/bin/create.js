const crypto = require('crypto');

// TODO
const createAuth = async () => {
  const currentDate = (new Date()).valueOf().toString();
  const random = Math.random().toString();
  const hash = crypto.createHash('sha256').update(`${currentDate}${random}`).digest('hex');
  const config = {
    id: hash,
    name: 'Click&Read',
    access: ['graphql', 'update', 'enrich'],
    attributes: '{ doi, is_oa, best_oa_location { url }} ' || 'all',
    allowed: true,
  };
  return config;
};

module.exports = createAuth;
