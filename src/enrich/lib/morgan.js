const morgan = require('morgan');
const fs = require('fs-extra');
const rfs = require('rotating-file-stream');
const path = require('path');
const { format } = require('date-fns');
const { accessLogRotate } = require('config');

const accessLogDir = path.resolve(__dirname, '..', 'log', 'access');

/**
 * Get the name of access file.
 *
 * @param {number} Date - date.
 *
 * @returns {string} Name of access file.
 */
function logFilename(time) {
  if (!time) return 'access.log';
  return `${format(new Date(time) - 1000 * 60 * 60 * 24, 'yyyy-MM-dd')}-access.log`;
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

module.exports = morgan(':ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ', { stream: accessLogStream });
