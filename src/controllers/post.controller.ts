import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePostBody, GetPublicPostsQuery, UpdatePostBody } from '@schemas/post.schema';
import PostService from '@services/post.service';
import { binding } from '@decorator/binding';
import { logger } from '@app/config';
import { ZodError } from 'zod';

interface AuthenticatedRequest extends FastifyRequest {
    user: {
        id: number;
        email: string;
        isAdmin: boolean;
    }
}

export default class PostController {
    @binding
    async getPublicPosts(request: FastifyRequest, reply: FastifyReply) {
        const { search } = GetPublicPostsQuery.parse(request.query);
        const posts = await PostService.getPublicPosts(search);
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
}
