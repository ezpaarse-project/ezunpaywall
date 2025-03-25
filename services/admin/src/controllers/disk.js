const { getDiskSpace, formatBytes } = require('../lib/disk');

async function diskController(req, res, next) {
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
}

module.exports = diskController;
