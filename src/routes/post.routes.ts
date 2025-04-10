import { FastifyInstance } from 'fastify';
import PostController from '@controllers/post.controller';
import { CreatePostSchema, GetPublicPostsSchema, updatePostSchema } from '@schemas/post.schema';
import { userMiddleware } from '@app/middleware/user.middleware';

const postController = new PostController();

export async function postRoutes(fastify: FastifyInstance) {
    
    fastify.get('/posts', {
        schema: GetPublicPostsSchema,
        preHandler: userMiddleware,
        handler: postController.getPublicPosts,
    });

    fastify.post('/posts', {
        schema: CreatePostSchema,
        preHandler: userMiddleware,
        handler: postController.createPost,
    });

    fastify .put('/posts/:id', {
        schema: updatePostSchema,
        preHandler: userMiddleware,
        handler: postController.editPost,
    });
}
