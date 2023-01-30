async function promiseWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, new Error('time out'));
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
