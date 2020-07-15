const {
  createLogger,
  transports,
  format,
} = require('winston');

require('winston-daily-rotate-file');

const path = require('path');

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp: currentTime }) => `${currentTime} ${level}: ${message}`);

// logger configuration
const logConfiguration = [
  new transports.DailyRotateFile({
    name: 'file',
    filename: path.resolve(__dirname, '%DATE%.log'),
    datePattern: 'yyyy-MM-DD',
    level: 'info',
  }),
];

// create the logger
module.exports = createLogger({
  format: combine(timestamp(), myFormat),
  transports: logConfiguration,
});
