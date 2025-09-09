const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUi = require('@fastify/swagger-ui');
const fp = require('fastify-plugin');

async function formatBasePlugin(fastify) {
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Example API',
        description: 'ezPAARSE-process API documentation',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          adminApiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'x-api-key',
            description: 'API key for admin access',
          },
        },
      },
    },
    exposeRoute: true,
    routePrefix: '/docs/json',
  });

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
  { name: 'ezr-openapi', encapsulate: false },
);

module.exports = formatPlugin;
