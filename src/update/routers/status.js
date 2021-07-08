const router = require('express').Router();

const { getStatus } = require('../bin/status');

/**
 * @apiSuccess status
 */
router.get('/update/status', (req, res) => res.status(200).json({ inUpdate: getStatus() }));

module.exports = router;
