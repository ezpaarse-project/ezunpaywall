const router = require('express').Router();

router.get('/ping', async (req, res, next) => res.status(200).json(true));
module.exports = router;
