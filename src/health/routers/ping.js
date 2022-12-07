const router = require('express').Router();

const pingAll = require('../bin/ping');

router.get('/', (req, res) => res.status(200).json('health service'));

router.get('/ping', (req, res, next) => res.status(200).json('pong'));

router.get('/health', async (req, res, next) => {
  const result = await pingAll();

  return res.status(200).json(result.map((e) => e.value));
});

module.exports = router;
