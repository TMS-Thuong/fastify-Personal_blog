import CommentController from '@controllers/comment.controller';
import { FastifyInstance } from 'fastify';

import { userMiddleware } from '@app/middleware/user.middleware';
import { CreateCommentSchema, DeleteCommentSchema, GetPostCommentsSchema } from '@app/schemas/comment.schema';

export async function commentRoutes(fastify: FastifyInstance) {
  fastify.get('/posts/:postId/comments', {
    schema: GetPostCommentsSchema,
    preHandler: userMiddleware,
    handler: CommentController.getList,
  });

  fastify.post('/posts/:postId/comments', {
    schema: CreateCommentSchema,
    preHandler: userMiddleware,
    handler: CommentController.create,
  });

  fastify.put('/posts/:postId/comments', {
    schema: CreateCommentSchema,
    preHandler: userMiddleware,
    handler: CommentController.update,
  });

  fastify.delete('/comments/:id', {
    schema: DeleteCommentSchema,
    preHandler: userMiddleware,
    handler: CommentController.delete,
  });
}
