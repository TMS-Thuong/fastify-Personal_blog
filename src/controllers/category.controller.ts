import { FastifyRequest, FastifyReply } from 'fastify';
import { binding } from '@decorator/binding';
import CategoryService from '@services/category.service';
import { CreateCategoryBody, GetCategoryById } from '@schemas/category.schema';
import { logger } from '@app/config';

export type AuthenticatedRequest = FastifyRequest & {
    user: {
        id: number;
        email: string;
        isAdmin: boolean;
    };
}
class CategoryController {
    @binding
    async getList(_req: FastifyRequest, reply: FastifyReply) {
        const categories = await CategoryService.getAllCategories();
        return reply.ok(categories);
    }

    @binding
    async show(req: FastifyRequest, reply: FastifyReply) {
        const params = GetCategoryById.parse(req.params);
        const category = await CategoryService.getCategoryById(Number(params.id));

        if (!category) {
            return reply.notFound('Danh mục không tồn tại');
        }

        return reply.ok(category);
    }

    @binding
    async createCategory(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const input = CreateCategoryBody.parse(request.body);

            const newCategory = await CategoryService.createCategory(input);

            return reply.created({
                id: newCategory.id,
                name: newCategory.name,
                description: newCategory.description,
                createdAt: newCategory.createdAt.toISOString(),
                updatedAt: newCategory.updatedAt.toISOString(),
            });
        } catch (error: any) {
            request.log.error(error);
            return reply.internalError(error.message);
        }
    }

}

export default new CategoryController();
