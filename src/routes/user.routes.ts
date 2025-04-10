import UserController from '@controllers/user.controller';
import { userMiddleware } from '@middleware/user.middleware';
import {
  getProfileSchema,
  getUserByIdSchema,
  updateAvatarSchema,
  updatePasswordSchema,
  updateUserSchema,
  getUserByIdZodSchema,
  updatePasswordZodSchema,
  updateUserZodSchema
} from '@schemas/user.schema';
import { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users/me', {
    schema: getProfileSchema,
    preHandler: userMiddleware,
    handler: UserController.profile,
  });

  fastify.get('/users/:id', {
    schema: getUserByIdSchema,
    preHandler: userMiddleware,
    handler: UserController.showUserById,
    preValidation: async (request, reply) => {
      const validation = fastify.validateWithZod(getUserByIdZodSchema, request.params);
      if (!validation.success) {
        return reply.badRequest(validation.message);
      }
    }
  });

  fastify.put('/users/me', {
    schema: updateUserSchema,
    preHandler: userMiddleware,
    handler: UserController.editProfile,
    preValidation: async (request, reply) => {
      const validation = fastify.validateWithZod(updateUserZodSchema.partial(), request.body);

      if (!validation.success) {
        return reply.badRequest(validation.message);
      }
    }
  });

  fastify.put('/users/me/password', {
    schema: updatePasswordSchema,
    preHandler: userMiddleware,
    handler: UserController.editPassword,
    preValidation: async (request, reply) => {
      const validation = fastify.validateWithZod(updatePasswordZodSchema.partial(), request.body);
      if (!validation.success) {
      }
    }
  });

  fastify.put('/users/me/avatar', {
    schema: updateAvatarSchema,
    preHandler: userMiddleware,
    validatorCompiler: ({ schema, method, url, httpPart }) => {
      if (httpPart === 'body') {
        return () => true;
      }
      return fastify.validatorCompiler({ schema, method, url, httpPart });
    },
    handler: UserController.updateAvatar,
  });
}