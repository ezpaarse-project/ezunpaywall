const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { paths, nodeEnv } = require('config');

const apacheFormat = winston.format.printf((info) => {
  const {
    method,
    ip,
    url,
    statusCode,
    userAgent,
    responseTime,
    countDOI,
  } = info.message;
  return `${info.timestamp} ${ip} ${method} ${url} ${statusCode} ${userAgent} ${responseTime} ${countDOI}`;
});

const transports = nodeEnv === 'development'
  ? [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ]
  : [
    new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ];

const accessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports,
});

module.exports = accessLogger;
