const config = require('config');

const { apikey } = config;

/**
 * Middleware for administrators route only
 *
 * @param request
 * @param reply
 */
function admin(request, reply, done) {
  const key = request.headers['x-api-key'];

  if (!key) {
    reply.code(401).send({ error: 'API key is missing' });
    return;
  }

  if (key !== apikey) {
    reply.code(403).send({ error: 'Invalid API key' });
    return;
  }

  done();
}

module.exports = admin;
