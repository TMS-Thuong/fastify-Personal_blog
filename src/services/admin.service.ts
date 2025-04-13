import { error } from 'console';

import { PrismaClient } from '@prisma/client';

import { logger } from '@app/config';
import { CreateCategoryInput, UpdateCategoryInput } from '@app/schemas/admin.schema';

class AdminService {
  private prisma = new PrismaClient();

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users;
  }

  async getUserById(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      return user;
    } catch (error) {
      console.error('Lỗi khi truy vấn user:', error);
      throw new Error('Database error');
    }
  }

  async getDashboardStats() {
    try {
      const totalUsers = await this.prisma.user.count();
      const totalPosts = await this.prisma.post.count();
      const totalComments = await this.prisma.comment.count();
      const totalCategories = await this.prisma.category.count();
      const totalMedia = await this.prisma.media.count();

      return {
        totalUsers,
        totalPosts,
        totalComments,
        totalCategories,
        totalMedia,
      };
    } catch (error) {
      console.error('Lỗi khi truy vấn thống kê:', error);
      throw new Error('Database error');
    }
  }

  async createCategory(input: CreateCategoryInput) {
    try {
      const newCategory = await this.prisma.category.create({
        data: {
          name: input.name,
          description: input.description || null,
        },
      });
      return newCategory;
    } catch {
      throw new Error('Tạo danh mục thất bại');
    }
  }

  async updateCategory(id: number, input: UpdateCategoryInput) {
    try {
      const existingCategory = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new Error('Danh mục không tồn tại');
      }

      logger.info(`Cập nhật danh mục ID ${id} với dữ liệu: ${JSON.stringify(input)}`);

      const updatedCategory = await this.prisma.category.update({
        where: { id },
        data: {
          name: input.name,
          description: input.description || null,
        },
      });

      logger.info(`Danh mục đã được cập nhật: ${JSON.stringify(updatedCategory)}`);
      return updatedCategory;
    } catch {
      throw error;
    }
  }

  async deleteCategory(id: number) {
    try {
      const categoryWithPosts = await this.prisma.category.findUnique({
        where: { id },
        include: {
          posts: {
            select: { id: true },
            take: 1,
          },
        },
      });

      if (!categoryWithPosts) {
        throw new Error('Danh mục không tồn tại');
      }

      if (categoryWithPosts.posts && categoryWithPosts.posts.length > 0) {
        throw new Error('Danh mục đang được sử dụng nên không thể xóa');
      }
      await this.prisma.category.delete({ where: { id } });
      return true;
    } catch (error) {
      throw error;
    }
  }
}

export default new AdminService();
