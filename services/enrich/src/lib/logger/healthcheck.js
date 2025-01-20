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

const healthcheckLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports: [
    new DailyRotateFile({
      filename: `${paths.log.healthCheckDir}/%DATE%-healthcheck.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

module.exports = healthcheckLogger;
