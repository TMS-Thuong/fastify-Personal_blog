import UserController from '@controllers/user.controller';
import { userMiddleware } from '@middleware/user.middleware';
import { getProfileSchema, getUserByIdSchema, updateAvatarSchema, updatePasswordSchema, updateUserSchema } from '@schemas/user.schema';
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
  });
  fastify.put('/users/me', {
    schema: updateUserSchema,
    preHandler: userMiddleware,
    handler: UserController.editProfile,
  });
  fastify.put('/users/me/password', {
    schema: updatePasswordSchema,
    preHandler: userMiddleware,
    handler: UserController.editPassword,
  });
  fastify.put('/users/me/avatar', {
    schema: updateAvatarSchema,
    preHandler: userMiddleware,
    handler: UserController.updateAvatar,
    attachValidation: false
  });
}

