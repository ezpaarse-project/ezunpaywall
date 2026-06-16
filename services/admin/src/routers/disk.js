const router = require('express').Router();

const checkAdmin = require('../middlewares/admin');

const { getDiskSpace, formatBytes } = require('../lib/disk');

/**
 * Route that get disk space.
 * Auth required.
 */
router.get('/disk', checkAdmin, async (req, res, next) => {
  let stats;

  try {
    stats = await getDiskSpace();
  } catch (err) {
    return next(err);
  }

  return res.status(200).json({
    total: formatBytes(stats.blocks * stats.bsize),
    available: formatBytes(stats.bavail * stats.bsize),
  });
});

module.exports = router;
