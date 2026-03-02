import type { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { adminRoute } from '~/routes/helper';

import {
  getOpenalexWorksList,
  downloadOpenalexWorks,
  getOpenalexWorksList2,
} from '~/lib/openalex/api';

import {
  insertWorksOpenalexJob
} from '~/lib/job';


const router: FastifyPluginAsync = async (fastify) => {
  fastify.route(adminRoute({
    method: 'GET',
    url: '/openalex/works/list',
    schema: {
      tags: ['admin'],
      summary: 'List all works available in openalex',
      description: 'List all works available in openalex',
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const res = await getOpenalexWorksList()
      reply.status(200).send(res)
    }
  }));

  fastify.route(adminRoute({
    method: 'GET',
    url: '/openalex/works/list2',
    schema: {
      tags: ['admin'],
      summary: 'List all works available in openalex',
      description: 'List all works available in openalex',
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      const res = await getOpenalexWorksList2()
      reply.status(200).send(res)
    }
  }));


  fastify.route(adminRoute({
    method: 'POST',
    url: '/openalex/works/download',
    schema: {
      tags: ['admin'],
      summary: 'Download all works available in openalex',
      description: 'Download all works available in openalex',
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      downloadOpenalexWorks()
    }
  }));

  fastify.route(adminRoute({
    method: 'POST',
    url: '/elastic/insert',
    schema: {
      tags: ['admin'],
      summary: 'Insert the content of installed file in index on elasticsearch',
      description: 'Insert the content of installed file in index on elasticsearch',
    },
    handler: async (_request: FastifyRequest, reply: FastifyReply): Promise<void> => {
      insertWorksOpenalexJob('openalex-works', '2025-07-22', '2025-07-23')
    }
  }));
};

export default router;