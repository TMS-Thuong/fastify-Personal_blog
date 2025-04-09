import { FastifyRequest, FastifyReply } from 'fastify';
import { binding } from '@decorator/binding';
import CategoryService from '@services/category.service';
import { GetCategoryById } from '@schemas/category.schema';


class CategoryController {
    @binding
    async getList(_req: FastifyRequest, reply: FastifyReply) {
        const categories = await CategoryService.getAllCategories();
        return reply.ok(categories);
    }

    async show(req: FastifyRequest, reply: FastifyReply) {
        const params = GetCategoryById.parse(req.params);
        const category = await CategoryService.getCategoryById(Number(params.id));

        if (!category) {
            return reply.notFound('Danh mục không tồn tại');
        }

        return reply.ok(category);
    }
}

export default new CategoryController();
