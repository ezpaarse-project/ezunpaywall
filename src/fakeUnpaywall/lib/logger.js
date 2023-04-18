const path = require('path');

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

// logger configuration
const processConfiguration = [
  new transports.DailyRotateFile({
    name: 'file',
    filename: path.resolve(__dirname, '..', 'log', 'application', '%DATE%.log'),
    datePattern: 'yyyy-MM-DD',
    level: 'info',
  }),
  new (transports.Console)(),
];

/**
 * Message logger format.
 *
 * @returns {import('winston').Logger.format} Logger format.
 */
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

logger.logError = logger.error;

function error(text, err) {
  logger.logError(text);
  if (err) {
    logger.logError(err);
  }
}
logger.error = error;

module.exports = logger;
