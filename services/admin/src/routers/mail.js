const checkAdmin = require('../plugins/admin');

const { contactMail } = require('../lib/mail');

function routes(fastify) {
  fastify.route({
    method: 'POST',
    url: '/contact',
    schema: {
      tags: ['Mail'],
      summary: 'Send contact mail',
      description: 'Send contact mail from demonstrator interface web',
      body: {
        type: 'object',
        required: ['email', 'subject', 'message'],
        properties: {
          email: { type: 'string', format: 'email' },
          subject: { type: 'string' },
          message: { type: 'string' },
        },
      },
      response: {
        202: { type: 'null' },
        400: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
    preHandler: checkAdmin,
    handler: async (request, reply) => {
      const { email, subject, message } = request.body;

      const pattern = /.+@.+\..+/;
      if (!pattern.test(email)) {
        return reply.code(400).send({ message: `Email [${email}] is invalid` });
      }

      contactMail(email, subject, message);

      return reply.code(202).send();
    },
  });
}

module.exports = routes;
