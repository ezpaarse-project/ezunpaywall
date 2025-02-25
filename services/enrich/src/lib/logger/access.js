const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { paths } = require('config');

const apacheFormat = winston.format.printf((info) => {
  const {
    ip,
    method,
    url,
    statusCode,
    userAgent,
    responseTime,
  } = info.message;
  return `${info.timestamp} ${ip} ${method} ${url} ${statusCode} ${userAgent} ${responseTime}`;
});

const transports = [];

if (process.env.NODE_ENV === 'test') {
  transports.push(new winston.transports.Console());
} else {
  transports.push(
    process.env.NODE_ENV === 'development' ? new winston.transports.Console() : new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  );
}

const accessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports,
});

module.exports = accessLogger;
