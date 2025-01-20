const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const { paths } = require('config');

const formatter = (info) => `${info.timestamp} ${info.level}: ${info.message} ${(info instanceof Error ? `\n\n${info.stack}\n` : '')}`;

const baseLogger = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV !== 'production' ? 'debug' : 'info'),
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(formatter),
  ),
};

winston.loggers.add('app', {
  ...baseLogger,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.label({ label: 'app' }),
        winston.format.printf(formatter),
      ),
    }),
    new DailyRotateFile({
      filename: `${paths.log.applicationDir}/%DATE%-application.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  ],
});

const appLogger = winston.loggers.get('app');
appLogger.on('error', (err) => appLogger.error(`[winston] ${err.toString()}`));

module.exports = appLogger;
