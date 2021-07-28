const morgan = require('morgan');
const rfs = require('rotating-file-stream');
const path = require('path');

const accessLogDir = path.resolve(__dirname, '..', 'out', 'logs');

function formatDate(d) {
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}

function logFilename(time) {
  if (!time) return 'access.log';

  return [formatDate(time), 'access.log'].join('-');
}

const accessLogStream = rfs.createStream(logFilename(new Date()), {
  interval: '1d', // rotate daily
  path: accessLogDir,
});

module.exports = morgan('combined', { stream: accessLogStream });
