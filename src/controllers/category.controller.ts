import { binding } from '@decorator/binding';
import {
  CreateCategoryBody,
  GetPostsByCategoryQuery,
  IdParamSchema,
  UpdateCategoryBody,
} from '@schemas/category.schema';
import CategoryService from '@services/category.service';
import { FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '@app/config';

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
  async showPostsByCategory(request: FastifyRequest, reply: FastifyReply) {
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

  @binding
  async create(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const input = CreateCategoryBody.parse(request.body);

      const newCategory = await CategoryService.createCategory(input);

      return reply.created(newCategory);
    } catch (error: unknown) {
      request.log.error(error);
      return reply.internalError();
    }
  }

  @binding
  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const input = UpdateCategoryBody.parse(request.body);

      const updatedCategory = await CategoryService.updateCategory(Number(id), input);
      logger.info('Category cập nhật thành công', updatedCategory);

      return reply.ok(updatedCategory);
    } catch (error: unknown) {
      request.log.error(error);
      return reply.internalError();
    }
  }

  @binding
  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      await CategoryService.deleteCategory(Number(id));
      logger.info(`Category ${id} xóa thành công`);

      return reply.code(204).send('Xóa thành công danh mục');
    } catch (error: unknown) {
      request.log.error(error);

      if (error instanceof Error) {
        if (error.message.includes('không tồn tại')) {
          return reply.notFound(error.message);
        }
        if (error.message.includes('đang được sử dụng')) {
          return reply.badRequest(error.message);
        }
        return reply.internalError(error.message);
      }
      return reply.internalError('Unexpected error occurred');
    }
  }
}

export default new CategoryController();
