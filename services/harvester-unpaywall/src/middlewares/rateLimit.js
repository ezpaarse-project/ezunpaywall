const rateLimit = require('express-rate-limit');

const rateLimiter = rateLimit({
  windowMs: 1000,
  max: 2,
});

module.exports = rateLimiter;
