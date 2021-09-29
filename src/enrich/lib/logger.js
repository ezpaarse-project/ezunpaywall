const path = require('path');
const homedir = require('os').homedir();

const {
  createLogger,
  transports,
  format,
} = require('winston');

require('winston-daily-rotate-file');

const {
  combine,
  timestamp,
  // label,
  printf,
  colorize,
} = format;

// TODO log for prod
// function prodFormat() {
//   const replaceError = ({
//     name, level, message, stack,
//   }) => ({
//     name, level, message, stack,
//   });
//   const replacer = (key, value) => (value instanceof Error ? replaceError(value) : value);
//   return combine(label({ name: 'ssr server log' }), format.json({ replacer }));
// }

let filename = path.resolve(homedir, 'var', 'log', 'ezunpaywall', 'enrich', '%DATE%.log');
if (process.env.NODE_ENV === 'development') {
  filename = path.resolve(__dirname, '..', 'log', '%DATE%.log');
}

// logger configuration
const processConfiguration = [
  new transports.DailyRotateFile({
    name: 'file',
    filename,
    datePattern: 'yyyy-MM-DD',
    level: 'info',
  }),
  new (transports.Console)(),
];

function devFormat() {
  const formatMessage = (info) => `${info.timestamp} ${info.level}: ${info.message}`;
  const formatError = (info) => `${info.timestamp} ${info.level}: ${info.message}\n\n${info.stack}\n`;
  const form = (info) => (info instanceof Error ? formatError(info) : formatMessage(info));
  return combine(colorize(), timestamp(), printf(form));
}

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  exitOnError: false,
  transports: processConfiguration,
  format: devFormat(),
});

module.exports = logger;
