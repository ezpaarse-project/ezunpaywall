import Fastify from 'fastify';
import { mkdir } from 'fs/promises';
import { resolve } from 'path';

import appLogger from './lib/logger/appLogger';
import { logConfig, config } from './lib/config';


import openapiPlugin from '~/plugins/openapi';

import openalexRouter from '~/routes/openalex';
import pingRouter from '~/routes/ping';
import configRouter from '~/routes/config';

const { paths } = config;

async function start () {
  await mkdir(resolve(paths.data.openalexDir), { recursive: true });
  const fastify = Fastify();

  // routes
  fastify.register(openapiPlugin)
  await fastify.register(openalexRouter, { prefix: '/' });
  await fastify.register(pingRouter, { prefix: '/' });
  await fastify.register(configRouter, { prefix: '/' });

  const address = await fastify.listen({ port: 3000, host: '::' });
  appLogger.info(`[fastify]: harvester openalex API at [${address}]`);

  // show config
  logConfig();
}

start();