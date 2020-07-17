const {
  createLogger,
  transports,
  format,
} = require('winston');

const {
  combine,
  timestamp,
  printf,
  colorize,
} = format;

require('winston-daily-rotate-file');

const path = require('path');

const myFormat = printf(({ level, message, timestamp: currentTime }) => `${currentTime} ${level}: ${message}`);

// logger configuration
const processConfiguration = [
  new transports.DailyRotateFile({
    name: 'file',
    filename: path.resolve('..', '..', 'logs', '%DATE%.log'),
    datePattern: 'yyyy-MM-DD',
    level: 'info',
  }),
  new (transports.Console)(),
];

const apiConfiguration = [
  new transports.File({
    filename: path.resolve('..', '..', 'logs', 'combined.log'),
  }),
  new transports.File({ filename: path.resolve('..', '..', 'logs', 'errors.log'), level: 'error' }),
  new (transports.Console)(),
];

// create the logger
module.exports = {
  process: createLogger({
    format: combine(timestamp(), myFormat),
    transports: processConfiguration,
  }),
  api: createLogger({
    level: 'info',
    format: combine(colorize(), timestamp(), myFormat),
    transports: apiConfiguration,
  }),
};
