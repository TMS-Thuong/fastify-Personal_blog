import { registerUser, loginHandler, refreshTokenHandler } from '@controllers/index';
import { LoginSchema, RefreshTokenSchema, registerUserSchema, VerifyEmailSchema } from '@schemas/index';
import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register/user', { schema: registerUserSchema }, registerUser);

  fastify.post('/auth/verify-email', { schema: VerifyEmailSchema }, async (request, reply) => {
    const { token } = request.query as { token: string };

    const result = await fastify.verifyEmailToken(token);

    if (result.success) {
      reply.send({ message: result.message });
    } else {
      reply.status(400).send({ message: result.message });
    }
  });

  fastify.post('/auth/login', { schema: LoginSchema }, loginHandler);

  fastify.post('/auth/refresh-token', { schema: RefreshTokenSchema }, refreshTokenHandler);
}
