const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');
const { format } = require('date-fns');

const accessLogDir = path.resolve(__dirname, '..', 'out', 'logs');

function logFilename(time) {
  return [time, 'access.log'].join('-');
}

const accessLogStream = rfs.createStream(logFilename(format(new Date(), 'yyyy-MM-dd')), {
  interval: '1d', // rotate daily
  path: accessLogDir,
});

morgan.token('ip', (req) => req.headers['x-forwarded-for'] || req.connection.remoteAddress);

morgan.token('user', (req) => {
  if (req.user) return req.user;
  return '-';
});

module.exports = morgan(':ip ":user" [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" ', { stream: accessLogStream });
