async function pingWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, new Error('time out'));
  });

  let error;
  let status = true;

  let reply;

  try {
    reply = await Promise.race([p1, p2]);
  } catch (err) {
    return {
      name, elapsedTime: Date.now() - start, error: err?.message, status: false,
    };
  }

  if (reply !== true) {
    error = reply;
    status = false;
  }

  return {
    name, elapsedTime: Date.now() - start, error, status,
  };
}

module.exports = pingWithTimeout;
