import winston from 'winston';
import type * as Transport from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from '~/lib/config';

const { paths } = config;

const formatter = (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message} ${(info instanceof Error ? `\n\n${info.stack}\n` : '')}`;

const baseLogger = {
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV !== 'production' ? 'debug' : 'info'),
  exitOnError: false,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(formatter),
  ),
};

const transports: Transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.label({ label: 'app' }),
      winston.format.printf(formatter),
    ),
  }),
];

if (process.env.NODE_ENV !== 'test') {
  mkdirSync(resolve(paths.log.applicationDir), { recursive: true });

  transports.push(
    new DailyRotateFile({
      filename: `${paths.log.applicationDir}/%DATE%-application.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  );
}

winston.loggers.add('app', {
  ...baseLogger,
  transports,
});

const appLogger = winston.loggers.get('app');
appLogger.on('error', (err) => appLogger.error(`[winston] ${err.toString()}`));

export default appLogger;
