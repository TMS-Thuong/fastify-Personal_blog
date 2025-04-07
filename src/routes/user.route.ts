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
    handler: UserController.show,
  });
  fastify.put('/users/me', {
    schema: updateUserSchema,
    preHandler: userMiddleware,
    handler: UserController.edit,
  });
  fastify.put('/users/me/password', {
    schema: updatePasswordSchema,
    preHandler: userMiddleware,
    handler: UserController.editPassword,
  });
  fastify.route({
    method: 'PATCH',
    url: '/api/users/me/avatar',
    schema: updateAvatarSchema,
    preHandler: userMiddleware,
    handler: UserController.update,
    attachValidation: false
  });
}

