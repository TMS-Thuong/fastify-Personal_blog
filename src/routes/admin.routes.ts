import AdminController from '@controllers/admin.controller';
import {
  CreateCategorySchema,
  DeleteCategorySchema,
  getDashboardStatsResponseSchema,
  getUserByIdResponseSchema,
  getUsersSchema,
  UpdateCategorySchema,
} from '@schemas/admin.schema';
import { FastifyInstance } from 'fastify';

import { adminMiddleware } from '@app/middleware/admin.middleware';

export async function adminRoutes(app: FastifyInstance) {
  app.get('/admin/users', {
    schema: getUsersSchema,
    preHandler: adminMiddleware,
    handler: AdminController.getUsers,
  });

  app.get('/admin/users/:id', {
    schema: getUserByIdResponseSchema,
    preHandler: adminMiddleware,
    handler: AdminController.showUserById,
  });

  app.get('/admin/dashboard/stats', {
    schema: getDashboardStatsResponseSchema,
    preHandler: adminMiddleware,
    handler: AdminController.getDashboardStats,
  });

  app.post('/admin/categories', {
    schema: CreateCategorySchema,
    preHandler: adminMiddleware,
    handler: AdminController.createCategory,
  });

  app.put('/admin/categories/:id', {
    schema: UpdateCategorySchema,
    preHandler: adminMiddleware,
    handler: AdminController.updateCategory,
  });

  app.delete('/admin/categories/:id', {
    schema: DeleteCategorySchema,
    preHandler: adminMiddleware,
    handler: AdminController.deleteCategory,
  });
}
