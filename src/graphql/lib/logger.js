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
    filename: path.resolve(__dirname, '..', 'logs', '%DATE%.log'),
    datePattern: 'yyyy-MM-DD',
    level: 'info',
  }),
  new (transports.Console)(),
];

const logger = createLogger({
  format: combine(colorize(), timestamp(), myFormat),
  transports: processConfiguration,
});

// create the logger
module.exports = {
  logger,
};
