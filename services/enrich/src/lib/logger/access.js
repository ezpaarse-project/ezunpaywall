const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { paths, nodeEnv } = require('config');

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

const accessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports: [
    nodeEnv === 'development' ? new winston.transports.Console() : null,
    new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

module.exports = accessLogger;
