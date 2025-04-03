import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET,
  });

  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.status(401).send({ message: 'Unauthorized' });
    }
  });
});
