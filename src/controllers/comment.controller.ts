import { FastifyRequest, FastifyReply } from 'fastify';
import { binding } from '@decorator/binding';
import { CreateCommentInput } from '@schemas/comment.schema';
import CommentService from '@services/comment.service';

class CommentController {
    @binding
    async createComment(
        request: FastifyRequest<{ Params: { postId: string }; Body: CreateCommentInput }>,
        reply: FastifyReply
    ) {
        const postId = parseInt(request.params.postId, 10);
        const { content } = request.body;
        const userId = request.user.id;

        if (isNaN(postId)) {
            return reply.badRequest('ID bài viết không hợp lệ');
        }

        const comment = await CommentService.addComment(userId, postId, content);

        if (!comment) {
            return reply.notFound('Bài viết không tồn tại hoặc không công khai');
        }

        return reply.created({ data: comment });
    }
}

export default new CommentController();
