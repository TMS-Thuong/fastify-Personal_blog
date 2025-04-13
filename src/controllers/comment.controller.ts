import { binding } from '@decorator/binding';
import { User } from '@prisma/client';
import { CreateCommentInput } from '@schemas/comment.schema';
import CommentService from '@services/comment.service';
import { FastifyRequest, FastifyReply } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user: User;
}

class CommentController {
  @binding
  async getList(request: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) {
    try {
      const postId = Number(request.params.postId);

      if (isNaN(postId)) {
        return reply.badRequest('ID bài viết không hợp lệ');
      }

      const comments = await CommentService.getList(postId);

      if (!comments) {
        return reply.notFound('Bài viết không tồn tại');
      }

      console.log('Comments to return:', JSON.stringify(comments));

      return reply.ok({ comments });
    } catch (error) {
      request.log.error(error, 'Lỗi khi lấy danh sách bình luận');
      return reply.internalError('Đã xảy ra lỗi khi lấy bình luận');
    }
  }

  @binding
  async create(request: FastifyRequest<{ Params: { postId: string }; Body: CreateCommentInput }>, reply: FastifyReply) {
    try {
      const postId = parseInt(request.params.postId, 10);
      const body: { content: string } = request.body as any;
      const content = body.content;

      if (!request.user || typeof request.user !== 'object' || !('id' in request.user)) {
        return reply.unauthorized('Bạn cần đăng nhập để thực hiện hành động này');
      }

      if (typeof request.user?.id !== 'number') {
        return reply.unauthorized('ID người dùng không hợp lệ');
      }

      const userId = request.user.id;

      if (isNaN(postId)) {
        return reply.badRequest('ID bài viết không hợp lệ');
      }

      console.log('userId:', userId);
      console.log('postId:', postId);
      console.log('content:', content);

      const comment = await CommentService.create(userId, postId, content);

      if (!comment) {
        return reply.notFound('Bài viết không tồn tại hoặc không công khai');
      }

      return reply.created(comment);
    } catch {
      return reply.internalError();
    }
  }

  @binding
  async update(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { content } = request.body as { content: string };
      const user = request.user;

      const updatedComment = await CommentService.update(Number(id), Number(user.id), content);

      if (!updatedComment) {
        return reply.notFound('Bình luận không tồn tại hoặc bạn không có quyền cập nhật');
      }

      return reply.code(200).send({
        message: 'Cập nhật bình luận thành công',
        data: updatedComment,
      });
    } catch (error) {
      request.log.error(error, 'Lỗi khi cập nhật bình luận');
      return reply.internalError('Đã xảy ra lỗi khi cập nhật bình luận');
    }
  }

  @binding
  async delete(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = request.user;

      const deleted = await CommentService.delete(Number(id), Number(user.id));

      if (!deleted) {
        return reply.notFound('Bình luận không tồn tại hoặc bạn không có quyền xóa');
      }

      return reply.ok({ message: 'Xóa bình luận thành công' });
    } catch {
      return reply.internalError();
    }
  }
}

export default new CommentController();
