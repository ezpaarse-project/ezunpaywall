import type { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

import all from '~/plugins/all';

const router: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/',
    schema: {
      tags: ['ping'],
      summary: 'Ping harvester openalex api service',
      description: 'Ping harvester openalex api service',
      response: {
        200: {
          description: 'OK',
          type: 'string',
          example: 'harvester openalex api service',
        },
      }
    },
    preHandler: all,
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      reply.code(200).send('harvester openalex api service');
    },
  });

  fastify.route({
    method: 'GET',
    url: '/ping',
    schema: {
      tags: ['ping'],
      summary: 'Ping harvester openalex api service',
      description: 'Ping harvester openalex api service',
      response: {
        200: {
          description: 'OK',
          type: 'object',
          properties: {
            message: { type: 'string' },
            responseTime: { type: 'number' },
          },
        },
      }
    },
    preHandler: all,
    handler: async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const endTime = Date.now();
      const responseTime = endTime - request.startTime;
      reply.code(200)
        .send({ message: 'Pong', responseTime })
        .headers({ 'x-response-time': responseTime });
    },
  });
};

export default router;
