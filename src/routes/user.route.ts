import UserController from '@controllers/user.controller';
import { userMiddleware } from '@middleware/user.middleware';
import { getProfileSchema, getUserByIdSchema } from '@schemas/user.schema';
import { FastifyInstance } from 'fastify';

export async function userRoutes(fastify: FastifyInstance) {
  fastify.get('/users/me', {
    schema: getProfileSchema,
    preHandler: userMiddleware,
    handler: UserController.show,
  });

  fastify.get('/users/:id', {
    schema: getUserByIdSchema,
    preHandler: userMiddleware,
    handler: UserController.showById,
  });
}
