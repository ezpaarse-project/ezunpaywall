async function pingWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'time out');
  });

  let error;

  try {
    await Promise.race([p1, p2]);
  } catch (err) {
    error = err?.message;
  }

  return {
    name, elapsedTime: Date.now() - start, error,
  };
}

module.exports = pingWithTimeout;
