import winston from 'winston';
import type * as Transport from 'winston-transport';
import DailyRotateFile from 'winston-daily-rotate-file';
import { format } from 'date-fns';

import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { config } from '~/lib/config';

const { paths } = config;

const apacheFormat = winston.format.printf((info) => {
  const {
    method,
    ip,
    url,
    statusCode,
    userAgent,
    responseTime,
  } = info.message;

  const timestamp = format(new Date(info.timestamp), 'dd/MMM/yyyy:HH:mm:ss xxx');

  return `${ip || '-'} "-" [${timestamp}] "${method} ${url} HTTP/1.1" ${statusCode} - "-" "${responseTime}" "${userAgent || '-'}"`;
});

const transports: Transport[] = [];

if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
  transports.push(new winston.transports.Console());
}

if (process.env.NODE_ENV !== 'test') {
  mkdirSync(resolve(paths.log.accessDir), { recursive: true });

  transports.push(
    new DailyRotateFile({
      filename: `${paths.log.accessDir}/%DATE%-access.log`,
      datePattern: 'YYYY-MM-DD',
    }),
  );
}

const accessLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    apacheFormat,
  ),
  transports,
});

export default accessLogger;
