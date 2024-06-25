const morgan = require('morgan');
const fs = require('fs-extra');
const rfs = require('rotating-file-stream');
const path = require('path');
const { format } = require('date-fns');
const { paths, healthcheckLogRotate } = require('config');

/**
 * Get the name of healthcheck log file.
 *
 * @param {number} date - Date in milliseconds
 *
 * @returns {string} Name of healthcheck log file.
 */
function logFilename(date) {
  if (!date) return 'healthcheck.log';
  return `${format(new Date(date) - 1000 * 60 * 60 * 24, 'yyyy-MM-dd')}-healthcheck.log`;
}

let healthCheckLogStream;

if (healthcheckLogRotate) {
  healthCheckLogStream = rfs.createStream(logFilename, {
    interval: '1d', // rotate daily
    path: paths.log.healthCheckDir,
  });
} else {
  healthCheckLogStream = fs.createWriteStream(path.resolve(paths.log.healthCheckDir, 'healthcheck.log'), { flags: 'a+' });
}

morgan.token('ip', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);

morgan.token('user', (req) => {
  if (req.user) return req.user;
  return '-';
});

module.exports = morgan(
  ':ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  { stream: healthCheckLogStream },
);
