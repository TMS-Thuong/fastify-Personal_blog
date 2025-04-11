// auth.routes.ts
import AuthController from '@controllers/auth.controller';
import {
  registerUserSchema,
  verifyEmailSchema,
  loginSchema,
  refreshTokenSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@schemas/auth.schema';
import { FastifyInstance } from 'fastify';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/auth/register', {
    schema: registerUserSchema,
    handler: AuthController.registerUser,
  });

  fastify.get('/auth/verify-email', {
    schema: verifyEmailSchema,
    handler: AuthController.verifyEmailController,
  });

  fastify.post('/auth/login', {
    schema: loginSchema,
    handler: AuthController.login,
  });

  // Refresh token
  fastify.post('/auth/refresh-token', {
    schema: refreshTokenSchema,
    handler: AuthController.refreshToken,
  });

  // Quên mật khẩu
  fastify.post('/auth/forgot-password', {
    schema: forgotPasswordSchema,
    handler: AuthController.forgotPassword,
  });

  // Đặt lại mật khẩu
  fastify.post('/auth/reset-password', {
    schema: resetPasswordSchema,
    handler: AuthController.resetPassword,
  });
}
