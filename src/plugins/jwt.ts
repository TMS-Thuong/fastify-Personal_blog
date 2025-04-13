import fastifyJwt from '@fastify/jwt';
import fp from 'fastify-plugin';

import { JWT_SECRET } from '@app/config';
import 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    id: number;
    email: string;
    isAdmin: boolean;
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
      await request.jwtVerify();
      console.log('decoded', request.user);
    } catch {
      return reply.unauthorized();
    }
  });
});
