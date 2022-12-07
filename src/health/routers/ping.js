const router = require('express').Router();

router.get('/', async (req, res) => res.status(200).json('health service'));

router.get('/ping', async (req, res, next) => res.status(200).json('pong'));

router.get('/health', async (req, res, next) => {
  const p1 = {};
  const p2 = {};
  const result = await Promise.all([p1, p2]);

  return res.status(200).json(result);
});

module.exports = router;
