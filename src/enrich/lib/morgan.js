const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const { format } = require('date-fns');

function logFilename(time) {
  if (!time) return 'access.log';
  return `${format(time, 'yyyy-MM-dd')}-access.log`;
}

const accessLogStream = rfs.createStream(logFilename, {
  interval: '1d', // rotate daily
  path: path.resolve(__dirname, '..', 'log'),
});

morgan.token('ip', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);

morgan.token('user', (req) => {
  if (req.user) return req.user;
  return '-';
});

module.exports = morgan(':ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ', { stream: accessLogStream });
