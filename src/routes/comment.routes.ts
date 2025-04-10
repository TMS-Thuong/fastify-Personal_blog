import { FastifyInstance } from 'fastify';
import CommentController from '@controllers/comment.controller';
import { userMiddleware } from '@app/middleware/user.middleware';
import { CreateCommentSchema } from '@app/schemas/comment.schema';

export async function commentRoutes(fastify: FastifyInstance) {

    fastify.post('/posts/:postId/comments', {
        schema: CreateCommentSchema,
        preHandler: userMiddleware,
        handler: CommentController.createComment,
    });
}
