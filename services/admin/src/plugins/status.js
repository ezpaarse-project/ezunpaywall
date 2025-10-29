const { getStatus } = require('../lib/update/status');

/**
 * Middleware that blocks simultaneous updates of unpaywall data.
 */
function checkStatus(request, reply, done) {
  const status = getStatus();
  if (status) {
    return reply.status(409).send({ message: 'Work in progress' });
  }

  done();
}

module.exports = checkStatus;
