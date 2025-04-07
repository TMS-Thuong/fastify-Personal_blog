import { FastifyInstance } from 'fastify';
import AuthController from '@controllers/auth.controller';

import {
  registerUserSchema,
  verifyEmailSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@schemas/auth.schema';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register/user', {
    schema: registerUserSchema,
    handler: AuthController.registerUser,
  });

  fastify.post('/auth/verify-email', {
    schema: verifyEmailSchema,
    handler: async (request, reply) => {
      const { token } = request.body as { token: string };
      const result = await fastify.verifyEmailToken(token);

      if (result.success) {
        reply.send({ message: result.message });
      } else {
        reply.badRequest(result.message);
      }
    },
  });

  fastify.post('/auth/login', {
    schema: loginSchema,
    handler: AuthController.login,
  });

  fastify.post('/auth/refresh-token', {
    schema: refreshTokenSchema,
    handler: AuthController.refreshToken,
  });

  fastify.post('/auth/forgot-password', {
    schema: forgotPasswordSchema,
    handler: AuthController.forgotPassword,
  });

  fastify.post('/auth/reset-password', {
    schema: resetPasswordSchema,
    handler: AuthController.resetPassword,
  });
}
