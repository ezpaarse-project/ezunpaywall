function myPromise(timeout, callback) {
  return new Promise((resolve, reject) => {
    // Set up the timeout
    const timer = setTimeout(() => {
      reject(new Error(`Promise timed out after ${timeout} ms`));
    }, timeout);

    // Set up the real work
    callback(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

module.exports = myPromise;
