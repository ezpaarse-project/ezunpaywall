async function pingWithTimeout(p1, name, timeout) {
  const start = Date.now();

  const p2 = new Promise((resolve, reject) => {
    setTimeout(reject, timeout, 'time out');
  });

  let res;

  try {
    res = await Promise.race([p1, p2]);
  } catch (err) {
    res = err;
  }

  return {
    name, status: res ?? true, elapsedTime: Date.now() - start,
  };
}

module.exports = pingWithTimeout;
