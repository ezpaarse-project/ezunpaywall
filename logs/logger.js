const {
  createLogger,
  transports,
  format,
} = require('winston');

const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`);

// logger configuration
const logConfiguration = [
  new transports.File({
    filename: './logs/result.log',
    level: 'info',
  }),
];

// create the logger
module.exports = createLogger({
  format: combine(timestamp(), myFormat),
  transports: logConfiguration,
});
