import PostController from '@controllers/post.controller';
import {
  CreatePostSchema,
  deletePostSchema,
  GetMyPostsSchema,
  GetPublicPostsSchema,
  linkPostWithSwaggerSchema,
  removeMediaFromPostSchema,
  updatePostSchema,
} from '@schemas/post.schema';
import { FastifyInstance } from 'fastify';

import { AuthenticatedRequest } from '@app/controllers/admin.controller';
import { userMiddleware } from '@app/middleware/user.middleware';

const postController = new PostController();

export async function postRoutes(fastify: FastifyInstance) {
  fastify.get('/posts', {
    schema: GetPublicPostsSchema,
    preHandler: userMiddleware,
    handler: postController.getListPublicPosts,
  });

  fastify.get('/posts/my-posts', {
    schema: GetMyPostsSchema,
    preHandler: userMiddleware,
    handler: postController.showMyPosts,
  });

  fastify.post('/posts', {
    schema: CreatePostSchema,
    preHandler: userMiddleware,
    handler: postController.createPost,
  });

  fastify.post('/posts/media', {
    preHandler: userMiddleware,
    schema: linkPostWithSwaggerSchema,
    handler: postController.linkPostWithMedia,
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

  fastify.delete('/posts/:postId/media', {
    schema: removeMediaFromPostSchema,
    preHandler: userMiddleware,
    handler: async (request, reply) => {
      return postController.deleteMediaFromPost(request as AuthenticatedRequest, reply);
    },
  });
}
