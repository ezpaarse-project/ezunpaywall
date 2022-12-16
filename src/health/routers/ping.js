const router = require('express').Router();

const pingAll = require('../bin/ping');

router.get('/', (req, res) => res.status(200).json('health service'));

router.get('/ping', (req, res, next) => res.status(200).json('pong'));

router.get('/health', async (req, res, next) => {
  let resultPing = await pingAll();

  resultPing = resultPing.map((e) => e.value);
  const result = {};

  resultPing.forEach((e) => {
    result[e?.name] = { elapsedTime: e?.elapsedTime, services: e?.services };
  });

  return res.status(200).json(result);
});

module.exports = router;
