import winston from 'winston';
import type * as Transport from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from '~/lib/config';

const { paths } = config;

const apacheFormat = winston.format.printf((info) => {
  const {
    method,
    url,
    statusCode,
    userAgent,
    responseTime,
  } = info.message;
  return `${info.timestamp} ${method} ${url} ${statusCode} ${userAgent} ${responseTime}`;
});

const transports: Transport[] = [];

if (process.env.NODE_ENV === 'test') {
  transports.push(new winston.transports.Console());
} else {
  mkdirSync(resolve(paths.log.healthCheckDir), { recursive: true });

  transports.push(
    new DailyRotateFile({
      filename: `${paths.log.healthCheckDir}/%DATE%-healthcheck.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  );
}

const healthcheckLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports,
});

export default healthcheckLogger;
