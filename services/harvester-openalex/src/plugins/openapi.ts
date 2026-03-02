import type { FastifyPluginAsync } from 'fastify';
import fastifySwagger, { type FastifyDynamicSwaggerOptions, type FastifySwaggerOptions } from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fp from 'fastify-plugin';

type PluginOptions = {
  transform?: FastifyDynamicSwaggerOptions['transform'],
  transformObject?: FastifyDynamicSwaggerOptions['transformObject'],
};

const formatBasePlugin: FastifyPluginAsync<PluginOptions> = async (fastify, opts) => {
  const options: FastifySwaggerOptions = {
    openapi: {
      info: {
        title: 'Example API',
        description: 'ReadHoldings API documentation',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          adminApiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: 'API key for admin access',
          }
        }
      },
    },
    exposeRoute: true,
    routePrefix: '/docs/json',
  };

  await fastify.register(fastifySwagger, options);

  await fastify.register(fastifySwaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });
}

const formatPlugin = fp(
  formatBasePlugin,
  { name: 'readholdings-openapi', encapsulate: false },
);

export default formatPlugin;
