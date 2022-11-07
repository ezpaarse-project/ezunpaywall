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
  printf,
  colorize,
} = format;

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

const errorRequest = (err) => {
  const params = Object.entries(err.config.params);

  let url = `${err.config.baseURL}${err.config.url}`;

  if (params) {
    url = `${url}?`;
    params.forEach((param) => {
      url = `${url}${param[0]}=${param[1]}&`;
    });
    url.substring(0, url.length - 1);
  }

  if (!err?.response) {
    logger.error(`Cannot ${err?.config?.method} ${url} - 503`);
    return;
  }
  logger.error(`Cannot ${err?.config?.method} ${url} - ${err?.response?.status}`);
};

logger.errorRequest = errorRequest;

module.exports = logger;
