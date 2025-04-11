import PostController from '@controllers/post.controller';
import {
  CreatePostSchema,
  deletePostSchema,
  GetMyPostsSchema,
  GetPublicPostsSchema,
  updatePostSchema,
} from '@schemas/post.schema';
import { FastifyInstance } from 'fastify';

import { userMiddleware } from '@app/middleware/user.middleware';

const postController = new PostController();

export async function postRoutes(fastify: FastifyInstance) {
  fastify.get('/posts', {
    schema: GetPublicPostsSchema,
    preHandler: userMiddleware,
    handler: postController.getListPublicPosts,
  });

  fastify.get('/posts/me', {
    schema: GetMyPostsSchema,
    preHandler: userMiddleware,
    handler: postController.showMyPosts,
  });

  fastify.post('/posts', {
    schema: CreatePostSchema,
    preHandler: userMiddleware,
    handler: postController.createPost,
  });

  fastify.put('/posts/:id', {
    schema: updatePostSchema,
    preHandler: userMiddleware,
    handler: postController.editPost,
  });

  fastify.delete('/posts/:id', {
    schema: deletePostSchema,
    preHandler: userMiddleware,
    handler: postController.deletePost,
  });
}
