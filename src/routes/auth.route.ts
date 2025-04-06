import AuthController from '@controllers/auth.controller';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  registerUserSchema,
  resetPasswordSchema,
  VerifyEmailSchema,
} from '@schemas/index';
import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register/user', { schema: registerUserSchema }, AuthController.registerUser);

  fastify.post('/auth/verify-email', { schema: VerifyEmailSchema }, async (request, reply) => {
    const { token } = request.query as { token: string };

    const result = await fastify.verifyEmailToken(token);

    if (result.success) {
      reply.send({ message: result.message });
    } else {
      reply.status(400).send({ message: result.message });
    }
  });

  fastify.post('/auth/login', { schema: LoginSchema }, AuthController.login);

  fastify.post('/auth/refresh-token', { schema: RefreshTokenSchema }, AuthController.refreshToken);

  fastify.post('/auth/forgot-password', { schema: ForgotPasswordSchema }, AuthController.forgotPassword);
  fastify.post('/auth/reset-password', { schema: resetPasswordSchema }, AuthController.resetPassword);
}
