const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { paths, nodeEnv } = require('config');

const apacheFormat = winston.format.printf((info) => {
  const {
    method,
    url,
    statusCode,
    contentLength,
    userAgent,
    responseTime,
  } = info.message;
  return `${info.timestamp} ${method} ${url} ${statusCode} ${contentLength} ${userAgent} ${responseTime}`;
});

const transports = [];

if (nodeEnv === 'test') {
  transports.push(new winston.transports.Console());
} else {
  transports.push(
    new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  );
}

const healthcheckLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports,
});

module.exports = healthcheckLogger;
