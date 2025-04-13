import { PrismaClient, Prisma, PostStatus } from '@prisma/client';

import { logger } from '@app/config';
import { CreatePostInput, UpdatePostInput } from '@app/schemas/post.schema';
class PostService {
  private prisma: PrismaClient;
  constructor() {
    this.prisma = new PrismaClient();
  }

  async getPostById(postId: number) {
    return this.prisma.post.findUnique({
      where: { id: postId },
    });
  }

  async getPosts(search?: string) {
    const where: Prisma.PostWhereInput = {
      status: 'PUBLIC',
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
        { summary: { contains: search, mode: Prisma.QueryMode.insensitive } },
      ];
    }

    return this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getMyPosts(userId: number) {
    return await this.prisma.post.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        summary: true,
        content: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
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
          status: input.status || 'DRAFT',
          userId: userId,
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

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

      if (input.status && !Object.values(PostStatus).includes(input.status)) {
        throw new Error('Trạng thái bài viết không hợp lệ.');
      }

      const updatedPost = await this.prisma.post.update({
        where: { id: postId },
        data: {
          title: input.title ?? undefined,
          summary: input.summary ?? undefined,
          content: input.content ?? undefined,
          categoryId: input.categoryId ?? undefined,
          status: input.status ?? post.status,
        },
        select: {
          id: true,
          title: true,
          summary: true,
          content: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          categoryId: true,
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

      await this.prisma.postMedia.deleteMany({
        where: { postId },
      });

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

  async linkPostWithMedia(postId: number, mediaIds: number[]) {
    try {
      const post = await this.prisma.post.findUnique({ where: { id: postId } });
      if (!post) {
        throw new Error('Không tìm thấy bài viết.');
      }

      const mediaList = await this.prisma.media.findMany({
        where: { id: { in: mediaIds } },
      });

      if (mediaList.length !== mediaIds.length) {
        throw new Error('Một hoặc nhiều ảnh không hợp lệ.');
      }

      const postMediaData = mediaIds.map((mediaId) => ({
        postId,
        mediaId,
      }));

      await this.prisma.postMedia.createMany({ data: postMediaData });

      const linkedMedia = mediaList.map((media) => ({
        id: media.id,
        url: media.url,
        type: media.type,
      }));

      logger.info(linkedMedia);

      return {
        message: 'Liên kết bài viết với ảnh thành công.',
        media: linkedMedia,
      };
    } catch (error) {
      console.error('Lỗi khi liên kết bài viết với media:', error);
      throw new Error('Không thể liên kết media với bài viết.');
    }
  }

  async removeMediaFromPost(userId: number, postId: number, mediaIds: number[]) {
    try {
      const post = await this.prisma.post.findUnique({
        where: { id: postId },
      });

      if (!post || post.userId !== userId) {
        throw new Error('Không tìm thấy bài viết hoặc bạn không có quyền');
      }

      await this.prisma.postMedia.deleteMany({
        where: {
          postId,
          mediaId: { in: mediaIds },
        },
      });
      logger.info(`User ${userId} đã gỡ media khỏi bài viết ID ${postId}`);

      // Đảm bảo trả về đối tượng có trường `message`
      return { message: 'Gỡ media thành công' }; // Đảm bảo có message trong response
    } catch (error) {
      console.error('Lỗi khi gỡ media khỏi bài viết:', error);
      throw error;
    }
  }
}

export default new PostService();
