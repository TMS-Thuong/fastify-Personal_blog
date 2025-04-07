import AuthController from '@controllers/auth.controller';
import {
  ForgotPasswordSchema,
  LoginSchema,
  RefreshTokenSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  VerifyEmailSchema,
} from '@schemas/index';
import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/auth/register/user',
    { schema: { body: RegisterUserSchema, tags: ['Auth'] } },
    AuthController.registerUser
  );

  fastify.post(
    '/auth/verify-email',
    { schema: { querystring: VerifyEmailSchema, tags: ['Auth'] } },
    async (request, reply) => {
      const { token } = request.query as { token: string };

      const result = await fastify.verifyEmailToken(token);

      if (result.success) {
        reply.send({ message: result.message });
      } else {
        reply.badRequest(result.message);
      }
    }
  );

  fastify.post('/auth/login', { schema: { body: LoginSchema, tags: ['Auth'] } }, AuthController.login);

  fastify.post(
    '/auth/refresh-token',
    { schema: { body: RefreshTokenSchema, tags: ['Auth'] } },
    AuthController.refreshToken
  );

  fastify.post(
    '/auth/forgot-password',
    { schema: { body: ForgotPasswordSchema, tags: ['Auth'] } },
    AuthController.forgotPassword
  );

  fastify.post(
    '/auth/reset-password',
    { schema: { body: ResetPasswordSchema, tags: ['Auth'] } },
    AuthController.resetPassword
  );
}
