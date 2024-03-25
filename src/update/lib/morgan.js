const morgan = require('morgan');
const fs = require('fs-extra');
const rfs = require('rotating-file-stream');
const path = require('path');
const { format } = require('date-fns');
const { nodeEnv, accessLogRotate } = require('config');

const accessLogDir = path.resolve(__dirname, '..', 'log', 'access');

const isProd = (nodeEnv === 'production');

/**
 * Get the name of access file.
 *
 * @param {number} date - Date in minisecond
 *
 * @returns {string} Name of access file.
 */
function logFilename(date) {
  if (!date) return 'access.log';
  return `${format(new Date(date) - 1000 * 60 * 60 * 24, 'yyyy-MM-dd')}-access.log`;
}

let accessLogStream;

if (accessLogRotate) {
  accessLogStream = rfs.createStream(logFilename, {
    interval: '1d', // rotate daily
    path: accessLogDir,
  });
} else {
  accessLogStream = fs.createWriteStream(path.resolve(accessLogDir, 'access.log'), { flags: 'a+' });
}

morgan.token('ip', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);

morgan.token('user', (req) => {
  if (req.user) return req.user;
  return '-';
});

module.exports = morgan(':ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ', { stream: isProd ? accessLogStream : process.stdout });
