async function pingWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'time out');
  });

  let error;

  const reply = await Promise.race([p1, p2]);

  if (reply !== true) error = reply;

  return {
    name, elapsedTime: Date.now() - start, error,
  };
}

module.exports = pingWithTimeout;
