const router = require('express').Router();

const healthCheckLogger = require('../lib/logger/healthcheck');

/**
 * Route use for healthcheck.
 */
router.get('/healthcheck', (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;

    healthCheckLogger.info({
      ip: req.ip,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      userAgent: req.get('User-Agent') || '-',
      responseTime: `${duration}ms`,
    });
  });
  return res.status(204).end();
});

module.exports = router;
