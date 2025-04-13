import { binding } from '@decorator/binding';
import { CreateCategoryBody, UpdateCategoryBody } from '@schemas/admin.schema';
import AdminService from '@services/admin.service';
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
  async getUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await AdminService.getAllUsers();
      const response = { users };
      return reply.ok(response);
    } catch {
      return reply.internalError('Lỗi khi lấy danh sách người dùng');
    }
  }

  @binding
  async showUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

    try {
      const user = await AdminService.getUserById(Number(id));

      if (!user) {
        return reply.notFound('Người dùng không tồn tại');
      }

      return reply.ok({ user });
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      return reply.internalError('Lỗi khi lấy thông tin người dùng');
    }
  }

  @binding
  async getDashboardStats(request: FastifyRequest, reply: FastifyReply) {
    try {
      const stats = await AdminService.getDashboardStats();

      return reply.ok({ stats });
    } catch (error) {
      console.error('Lỗi khi lấy thống kê tổng quan:', error);
      return reply.internalError('Lỗi khi lấy thống kê tổng quan');
    }
  }

  @binding
  async createCategory(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const input = CreateCategoryBody.parse(request.body);

      const newCategory = await AdminService.createCategory(input);

      return reply.created(newCategory);
    } catch (error: unknown) {
      request.log.error(error);
      return reply.internalError();
    }
  }

  @binding
  async updateCategory(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const input = UpdateCategoryBody.parse(request.body);

      const updatedCategory = await AdminService.updateCategory(Number(id), input);
      logger.info('Category cập nhật thành công', updatedCategory);

      return reply.ok(updatedCategory);
    } catch {
      return reply.internalError();
    }
  }

  @binding
  async deleteCategory(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: number };
      const categoryId = Number(id);

      if (isNaN(categoryId)) {
        return reply.badRequest('ID không hợp lệ');
      }

      await AdminService.deleteCategory(categoryId);

      return reply.status(204).send({ message: 'Xóa thành công danh mục' });
    } catch (error) {
      if (error instanceof Error) {
        return reply.badRequest(error.message);
      }
      return reply.internalError('Đã xảy ra lỗi không mong muốn');
    }
  }
}

export default new CategoryController();
