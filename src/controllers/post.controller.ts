import { binding } from '@decorator/binding';
import { CreatePostBody, GetPublicPostsQuery, linkPostWithMediaSchema, UpdatePostBody } from '@schemas/post.schema';
import PostService from '@services/post.service';
import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

import { logger } from '@app/config';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

export default class PostController {
  @binding
  async getListPublicPosts(request: FastifyRequest, reply: FastifyReply) {
    const { search } = GetPublicPostsQuery.parse(request.query);
    const posts = await PostService.getPosts(search);
    return reply.ok(posts);
  }

  @binding
  async showMyPosts(request: AuthenticatedRequest, reply: FastifyReply) {
    const userId = request.user.id;
    const posts = await PostService.getMyPosts(userId);
    return reply.ok(posts);
  }

  @binding
  async createPost(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const input = CreatePostBody.parse(request.body);
      const user = request.user;

      if (input.isDraft === undefined) {
        input.isDraft = input.isPublic === false;
      }

      logger.info(`input`, input);
      const newPost = await PostService.createPost(Number(user.id), {
        ...input,
      });

      logger.info(`User ${user.id} created a new post with ID: ${newPost.id}`);
      return reply.created(newPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => `- ${issue.message}`).join('\n');
        return reply.badRequest(`Dữ liệu không hợp lệ: ${messages}`);
      }
      request.log.error('Lỗi không xác định xảy ra');
      return reply.internalError('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
    }
  }

  @binding
  async editPost(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const input = UpdatePostBody.parse(request.body);
      const user = request.user;

      if (input.isDraft === undefined) {
        input.isDraft = input.isPublic === false;
      }

      const updatedPost = await PostService.updatePost(Number(user.id), Number(id), {
        ...input,
      });

      if (!updatedPost) {
        return reply.notFound('Bài viết không tồn tại');
      }

      return reply.ok(updatedPost);
    } catch (error) {
      if (error instanceof ZodError) {
        const messages = error.issues.map((issue) => `- ${issue.message}`).join('\n');
        return reply.badRequest(`Dữ liệu không hợp lệ:\n${messages}`);
      }
      request.log.error('Lỗi không xác định xảy ra');
      return reply.internalError('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
    }
  }

  @binding
  async deletePost(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = request.user;

      const deleted = await PostService.deletePost(Number(user.id), Number(id));
      if (!deleted) {
        return reply.notFound('Bài viết không tồn tại hoặc bạn không có quyền xóa.');
      }

      return reply.ok({ message: 'Xóa bài viết thành công.' });
    } catch (error) {
      request.log.error(error, 'Lỗi khi xóa bài viết');
      return reply.internalError('Đã xảy ra lỗi khi xóa bài viết.');
    }
  }
  @binding
  async linkPostWithMedia(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const parsed = linkPostWithMediaSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.badRequest('Dữ liệu đầu vào không hợp lệ');
      }

      const { postId, mediaIds } = parsed.data;
      const user = request.user;

      const post = await PostService.getPostById(postId);
      if (!post || post.userId !== user.id) {
        return reply.forbidden('Bạn không có quyền liên kết Media với bài viết này.');
      }

      const result = await PostService.linkPostWithMedia(postId, mediaIds);
      logger.info(`User ${user.id} linked media with post ID ${postId}:`, result.media);

      return reply.ok({
        message: 'Liên kết bài viết với ảnh thành công.', // Đảm bảo có trường message
        media: Array.isArray(result.media) ? result.media : Object.values(result.media),
      });
    } catch (error) {
      request.log.error(error);
      return reply.internalError('Đã xảy ra lỗi khi liên kết media với bài viết'); // Thêm message
    }
  }
}
