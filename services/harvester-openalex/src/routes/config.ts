import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { adminRoute } from '~/routes/helper';
import { getConfig } from '~/lib/config';
import defaultConfig from '~/../config/default.json';

const router: FastifyPluginAsync = async (fastify) => {
  fastify.route(adminRoute({
    method: 'GET',
    url: '/config',
    schema: {
      tags: ['config'],
      summary: 'Get config of readholdings',
      description: 'Get config of readholdings without secret',
      response: {
        200: {
          description: 'Config',
          type: 'object',
          example: defaultConfig
        }
      }
    },
    config: {
      rateLimit: {
        max: 60,
        timeWindow: '1 minute',
      },
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const config = await getConfig();
      reply.code(200).send(config);
    }
  }));
};

export default router;
