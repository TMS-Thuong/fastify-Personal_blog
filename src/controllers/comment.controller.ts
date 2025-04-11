import { binding } from '@decorator/binding';
import { CreateCommentInput } from '@schemas/comment.schema';
import CommentService from '@services/comment.service';
import { FastifyRequest, FastifyReply } from 'fastify';

class CommentController {
  @binding
  async createComment(
    request: FastifyRequest<{ Params: { postId: string }; Body: CreateCommentInput }>,
    reply: FastifyReply
  ) {
    try {
      const postId = parseInt(request.params.postId, 10);
      const body: { content: string } = request.body as any;
      const content = body.content;

      if (!request.user) {
        return reply.unauthorized('Bạn cần đăng nhập để thực hiện hành động này');
      }

      const userId = request.user.id;

      if (isNaN(postId)) {
        return reply.badRequest('ID bài viết không hợp lệ');
      }

      console.log('userId:', userId);
      console.log('postId:', postId);
      console.log('content:', content);

      const comment = await CommentService.addComment(userId, postId, content);

      if (!comment) {
        return reply.notFound('Bài viết không tồn tại hoặc không công khai');
      }

      return reply.created(comment);
    } catch (error) {
      console.error('Error in createComment:', error);
      return reply.internalError(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
  }
}

export default new CommentController();
