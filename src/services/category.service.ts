import { Prisma, PrismaClient, PostStatus } from '@prisma/client';

import { logger } from '@app/config';
import { GetPostsByCategoryQuery } from '@app/schemas/category.schema';

class CategoryService {
  private prisma = new PrismaClient();

  async getAllCategories() {
    try {
      const categories = await this.prisma.category.findMany();
      if (!categories || categories.length === 0) {
        throw new Error('Không có danh mục nào');
      }
      return categories;
    } catch (error) {
      throw new Error(error.message || 'Lỗi lấy danh sách danh mục');
    }
  }

  async getCategoryById(id: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id },
      });

      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      return category;
    } catch (error) {
      logger.error('Lỗi khi lấy category:', error);
      throw error;
    }
  }

  async getPostsByCategory(categoryId: number, query: GetPostsByCategoryQuery, userId: number) {
    try {
      const category = await this.prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new Error('Danh mục không tồn tại');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { isAdmin: true },
      });

      const isAdmin = user?.isAdmin || false;

      const filter: Prisma.PostWhereInput = {
        categoryId,
      };

      if (!isAdmin) {
        filter.OR = [{ status: PostStatus.PUBLIC }, { userId: userId }];
      }

      if (query.search) {
        filter.AND = [
          {
            OR: [
              { title: { contains: query.search, mode: 'insensitive' } },
              { content: { contains: query.search, mode: 'insensitive' } },
              { summary: { contains: query.search, mode: 'insensitive' } },
            ],
          },
        ];
      }

      const posts = await this.prisma.post.findMany({
        where: filter,
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          userId: true,
          user: { select: { id: true, firstName: true, lastName: true } },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return posts.map((post) => ({
        ...post,
        // Add backwards compatibility for clients expecting isPublic and isDraft
        isPublic: post.status === PostStatus.PUBLIC,
        isDraft: post.status === PostStatus.DRAFT,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        isOwner: post.userId === userId,
      }));
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Lấy danh sách bài viết theo danh mục thất bại');
    }
  }
}

export default new CategoryService();
