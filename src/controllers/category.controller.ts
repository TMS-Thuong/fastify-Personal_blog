import { binding } from '@decorator/binding';
import { GetPostsByCategoryQuery, IdParamSchema } from '@schemas/category.schema';
import CategoryService from '@services/category.service';
import { FastifyRequest, FastifyReply } from 'fastify';

export type AuthenticatedRequest = FastifyRequest & {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
};
class CategoryController {
  @binding
  async getList(_req: FastifyRequest, reply: FastifyReply) {
    const categories = await CategoryService.getAllCategories();
    return reply.ok(categories);
  }

  @binding
  async showPostsByCategory(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const query = request.query as GetPostsByCategoryQuery;

      const userId = request.user ? request.user.id : 0;

      const posts = await CategoryService.getPostsByCategory(Number(id), query, userId);

      return reply.code(200).send({
        data: posts,
      });
    } catch (error) {
      request.log.error(error);
      if (error instanceof Error) {
        if (error.message.includes('không tồn tại')) {
          return reply.notFound(error.message);
        }
        return reply.internalError(error.message);
      }
      return reply.internalError('Đã xảy ra lỗi không xác định');
    }
  }

  @binding
  async show(req: FastifyRequest, reply: FastifyReply) {
    const params = IdParamSchema.parse(req.params);
    const category = await CategoryService.getCategoryById(Number(params.id));

    if (!category) {
      return reply.notFound('Danh mục không tồn tại');
    }

    return reply.ok(category);
  }
}

export default new CategoryController();
