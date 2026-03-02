import type { RouteOptions } from 'fastify';

import admin from '~/plugins/admin';

import { unauthorized, forbidden, internalServerError } from '~/plugins/responses';

export function adminRoute(opts: RouteOptions): RouteOptions {
  return {
    ...opts,
    preHandler: admin,
    schema: {
      ...(opts.schema ?? {}),
      security: [{ adminApiKey: [] }],
      response: {
        ...(opts.schema?.response ?? {}),
        401: unauthorized,
        403: forbidden ,
        500: internalServerError,
      },
    },
  };
}
