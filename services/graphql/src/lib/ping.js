const { healthTimeout } = require('config');

/**
 * Executes a promise but cuts it off after a while if it has not been resolved.
 * this function is used for healthcheck routes.
 *
 * @param {Promise} p1 - Promise to be executed which will be
 * stopped if it does not solve after a certain time.
 * @param {string} name - Name of service.
 *
 * @returns {Promise<Object>} Status of healthcheck with name, time, optional error and healthy.
 */
async function promiseWithTimeout(p1, name) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, healthTimeout, new Error('time out'));
  });

  let error;
  let healthy = true;

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    return {
      name, elapsedTime: Date.now() - start, error: err?.message, healthy: false,
    };
  }

  if (reply !== true) {
    error = reply;
    healthy = false;
  }

  return {
    name, elapsedTime: Date.now() - start, error, healthy,
  };
}

module.exports = promiseWithTimeout;
