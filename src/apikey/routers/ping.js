const router = require('express').Router();
const { pingRedis } = require('../lib/service/redis');

router.get('/', async (req, res) => res.status(200).json('apikey service'));

router.get('/ping', async (req, res, next) => res.status(204));

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

router.get('/health', async (req, res, next) => {
  const start = Date.now();

  let status;
  try {
    status = await myPromise(3000, async (resolve, reject) => {
      const resultPing = await pingRedis();
      if (resultPing) return resolve(true);
      return reject(false);
    });
  } catch (err) {
    return res.status(200).json({
      name: 'redis', status: false, elapsedTime: 3000, error: 'time out',
    });
  }

  const end = Date.now();

  return res.status(200).json({
    name: 'redis', status, elapsedTime: end - start,
  });
});

module.exports = router;
