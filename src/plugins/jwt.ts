import { JWT_SECRET } from '@app/config';
import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';
import 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: number;
      email: string;
      isAdmin: boolean;
    };
  }
}

export default fp(async (fastify) => {
  fastify.register(fastifyJwt, {
    secret: JWT_SECRET,
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
