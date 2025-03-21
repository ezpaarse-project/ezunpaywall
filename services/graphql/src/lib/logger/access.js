const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { paths } = require('config');
const { format } = require('date-fns');

const apacheFormat = winston.format.printf((info) => {
  const {
    method,
    ip,
    url,
    statusCode,
    userAgent,
    responseTime,
    countDOI,
    user,
  } = info.message;

  const timestamp = format(new Date(info.timestamp), 'dd/MMM/yyyy:HH:mm:ss xxx');

  return `${ip || '-'} "${user || '-'}" [${timestamp}] "${method} ${url} HTTP/1.1" ${statusCode} - "-" "${responseTime}" "${userAgent || '-'}" "${countDOI || 0}"`;
});

const transports = [];

if (process.env.NODE_ENV === 'development') {
  transports.push(new winston.transports.Console());
  transports.push(
    new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  );
} else {
  transports.push(
    new DailyRotateFile({
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
