import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
    sign: {
      expiresIn: '2h',
    },
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      const decoded = await request.jwtVerify();
      request.user = decoded;
    } catch (err) {
      return reply.unauthorized();
    }
  });
});
