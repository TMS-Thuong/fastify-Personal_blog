import CategoryController from '@controllers/category.controller';
import { GetCategoriesSchema, GetCategoryByIdSchema, GetPostsByCategorySchema } from '@schemas/category.schema';
import { FastifyInstance } from 'fastify';

import { userMiddleware } from '@app/middleware/user.middleware';

export async function categoryRoutes(app: FastifyInstance) {
  app.get('/categories', {
    schema: GetCategoriesSchema,
    preHandler: userMiddleware,
    handler: CategoryController.getList,
  });

  app.get('/categories/:id', {
    schema: GetCategoryByIdSchema,
    preHandler: userMiddleware,
    handler: CategoryController.show,
  });

  app.get('/categories/:id/posts', {
    schema: GetPostsByCategorySchema,
    preHandler: userMiddleware,
    handler: CategoryController.showPostsByCategory,
  });
}
