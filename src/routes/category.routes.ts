import { FastifyInstance } from 'fastify';
import CategoryController from '@controllers/category.controller';
import {
    CreateCategorySchema,
    DeleteCategorySchema,
    GetCategoriesSchema,
    GetCategoryByIdSchema,
    GetPostsByCategorySchema,
    UpdateCategorySchema,
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

    app.get('/categories/:id/posts', {
        schema: GetPostsByCategorySchema ,
        preHandler: userMiddleware,
        handler: CategoryController.getPostsByCategory,
    });

    app.post('/admin/categories', {
        schema: CreateCategorySchema,
        preHandler: [userMiddleware, adminMiddleware],
        handler: CategoryController.create,
    });

    app.put('/admin/categories/:id', {
        schema: UpdateCategorySchema,
        preHandler: [userMiddleware, adminMiddleware],
        handler: CategoryController.update,
    });

    app.delete('/admin/categories/:id', {
        schema: DeleteCategorySchema,
        preHandler: [userMiddleware, adminMiddleware],
        handler: CategoryController.delete,
    });
}
