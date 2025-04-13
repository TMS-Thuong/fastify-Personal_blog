import { binding } from '@decorator/binding';
import { CreatePostBody, GetPublicPostsQuery, linkPostWithMediaSchema, UpdatePostBody } from '@schemas/post.schema';
import PostService from '@services/post.service';
import { FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '@app/config';

interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
}

class PostController {
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

      if (input.status === undefined) {
        input.status = 'DRAFT';
      }

      logger.info(`input`, input);

      const newPost = await PostService.createPost(Number(user.id), {
        ...input,
      });

      logger.info(`User ${user.id} created a new post with ID: ${newPost.id}`);

      return reply.created(newPost);
    } catch {
      return reply.internalError('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
    }
  }

  @binding
  async editPost(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const input = UpdatePostBody.parse(request.body);
      const user = request.user;
      if (input.status === undefined) {
        input.status = 'DRAFT';
      }

      const updatedPost = await PostService.updatePost(Number(user.id), Number(id), {
        ...input,
      });

      if (!updatedPost) {
        return reply.notFound('Bài viết không tồn tại');
      }

      return reply.ok(updatedPost);
    } catch {
      return reply.internalError();
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

      return reply.send({ message: 'Xóa bài viết thành công.' });
    } catch {
      return reply.internalError();
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

      const post = await PostService.getPostById(Number(postId));
      if (!post || post.userId !== user.id) {
        return reply.forbidden('Bạn không có quyền liên kết Media với bài viết này.');
      }

      const media = await request.server.prisma.media.findMany({
        where: {
          id: { in: mediaIds },
          userId: user.id,
        },
      });

      if (media.length !== mediaIds.length) {
        return reply.forbidden('Media không thuộc quyền sở hữu của bạn.');
      }

      const result = await PostService.linkPostWithMedia(postId, mediaIds);
      return reply.ok({
        message: 'Liên kết bài viết với ảnh thành công.',
        media: Array.isArray(result.media) ? result.media : Object.values(result.media),
      });
    } catch {
      return reply.internalError();
    }
  }

  @binding
  async deleteMediaFromPost(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { postId } = request.params as { postId: number };
      const { mediaIds } = request.body as { mediaIds: number[] };
      const user = request.user as { id: number; email: string; isAdmin: boolean };

      if (!user) {
        return reply.unauthorized('Bạn cần đăng nhập để thực hiện hành động này');
      }

      const post = await PostService.getPostById(postId);
      if (!post || post.userId !== user.id) {
        return reply.forbidden('Bạn không có quyền gỡ media khỏi bài viết này');
      }

      const result = await PostService.removeMediaFromPost(user.id, postId, mediaIds);

      if (!result || !result.message) {
        return reply.internalError('Đã xảy ra lỗi khi gỡ media khỏi bài viết');
      }

      return reply.status(204).send({ message: result.message });
    } catch {
      return reply.internalError();
    }
  }
}

export default new PostController();
