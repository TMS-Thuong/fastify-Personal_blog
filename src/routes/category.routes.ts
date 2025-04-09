import { FastifyInstance } from 'fastify';
import CategoryController from '@controllers/category.controller';
import {
    CreateCategorySchema,
    GetCategoriesSchema,
    GetCategoryByIdSchema,
} from '@schemas/category.schema';
import { userMiddleware } from '@app/middleware/user.middleware';
import { adminMiddleware } from '@app/middleware/admin.middleware';

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
    app.post('/admin/categories', {
        schema: CreateCategorySchema,
        preHandler: [userMiddleware, adminMiddleware],
        handler: CategoryController.createCategory,
    });

}
