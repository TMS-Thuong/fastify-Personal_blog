import { PrismaClient, Prisma } from '@prisma/client';

import { logger } from '@app/config';
import { CreatePostInput, UpdatePostInput } from '@app/schemas/post.schema';
class PostService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getPublicPosts(search?: string) {
    try {
      let where: Prisma.PostWhereInput = {
        isPublic: true,
        isDraft: false,
      };

      if (search) {
        where = {
          isPublic: true,
          isDraft: false,
          OR: [
            { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { summary: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        };
      }

      const posts = await this.prisma.post.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      if (!posts || posts.length === 0) {
        throw new Error('Không tìm thấy bài viết nào.');
      }

      return posts;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bài viết public:', error);
      throw error;
    }
  }

  async getMyPosts(userId: number) {
    try {
      return await this.prisma.post.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          isPublic: true,
          isDraft: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (error) {
      console.error('Lỗi khi lấy bài viết của user:', error);
      throw new Error('Không thể lấy danh sách bài viết của bạn');
    }
  }

  async createPost(userId: number, input: CreatePostInput) {
    try {
      if (input.categoryId <= 0) {
        throw new Error('categoryId phải là một giá trị hợp lệ.');
      }

      const post = await this.prisma.post.create({
        data: {
          title: input.title,
          summary: input.summary || null,
          content: input.content,
          categoryId: input.categoryId,
          isPublic: input.isPublic || false,
          isDraft: input.isDraft || false,
          userId: userId,
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          isPublic: true,
          isDraft: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!post) {
        throw new Error('Không thể tạo bài viết.');
      }
      logger.info(`Bài viết mới đã được tạo với ID: ${post.id}`);

      return post;
    } catch (error) {
      console.error(error);
      throw new Error('Tạo bài viết thất bại');
    }
  }

  async updatePost(userId: number, postId: number, input: UpdatePostInput) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post || post.userId !== userId) {
        throw new Error('Không có quyền sửa bài viết này.');
      }

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          title: input.title,
          summary: input.summary || null,
          content: input.content,
          categoryId: input.categoryId,
          isPublic: input.isPublic || false,
          isDraft: input.isDraft || false,
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          isPublic: true,
          isDraft: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return updatedPost;
    } catch (error) {
      console.error(error);
      throw new Error(error.message || 'Cập nhật bài viết thất bại');
    }
  }

  async deletePost(userId: number, postId: number) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post || post.userId !== userId) {
        return false;
      }

      // await this.prisma.postMedia.deleteMany({
      //     where: { postId },
      // });

      await this.prisma.post.delete({
        where: { id: postId },
      });

      logger.info(`User ${userId} đã xóa bài viết ID ${postId}`);
      return true;
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      throw error;
    }
  }
}

export default new PostService();
