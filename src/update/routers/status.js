const router = require('express').Router();

const { getStatus } = require('../bin/status');

/**
 * @return status
 */
router.get('/status', (req, res) => res.status(200).json({ inUpdate: getStatus() }));

module.exports = router;
