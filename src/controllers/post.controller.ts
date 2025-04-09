import { FastifyRequest, FastifyReply } from 'fastify';
import { CreatePostBody, GetPublicPostsQuery } from '@schemas/post.schema';
import PostService from '@services/post.service';
import { binding } from '@decorator/binding';

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

            const isDraft = input.isPublic === false;

            const postData = {
                ...input,
                isDraft,
            };

            const newPost = await PostService.createPost(Number(user.id), postData);
            return reply.created(newPost);
        } catch (error) {
            if (error instanceof Error) {
                request.log.error(error);
                return reply.internalError('Đã xảy ra lỗi trong quá trình tạo bài viết: ' + error.message);
            }
            request.log.error('Lỗi không xác định xảy ra');
            return reply.internalError('Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.');
        }
    }
}
