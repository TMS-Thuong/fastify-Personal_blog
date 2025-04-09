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
      try {
        const { id } = request.params as { id: string };
        getUserByIdZodSchema.parse({ id });
      } catch (error) {
        return reply.badRequest(error);
      }
    }
  });

  fastify.put('/users/me', {
    schema: updateUserSchema,
    preHandler: userMiddleware,
    handler: UserController.editProfile,
    preValidation: async (request, reply) => {
      try {
        updateUserZodSchema.parse(request.body);
      } catch (error) {
        return reply.badRequest(error);
      }
    }
  });

  fastify.put('/users/me/password', {
    schema: updatePasswordSchema,
    preHandler: userMiddleware,
    handler: UserController.editPassword,
    preValidation: async (request, reply) => {
      try {
        updatePasswordZodSchema.parse(request.body);
      } catch (error) {
        return reply.badRequest(error);
      }
    }
  });

  fastify.put('/users/me/avatar', {
    schema: updateAvatarSchema,
    preHandler: userMiddleware,
    handler: UserController.updateAvatar,
  });
}