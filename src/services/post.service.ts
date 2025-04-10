import { logger } from '@app/config';
import { CreatePostInput } from '@app/schemas/post.schema';
import { PrismaClient, Prisma } from '@prisma/client';
class PostService {
    private prisma: PrismaClient;
    constructor() {
        this.prisma = new PrismaClient();
    }

    async getPublicPosts(search?: string) {
        try {
            let where: Prisma.PostWhereInput = {
                isPublic: true,
                isDraft: false,
            };

            if (search) {
                where = {
                    isPublic: true,
                    isDraft: false,
                    OR: [
                        { title: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        { content: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        { summary: { contains: search, mode: Prisma.QueryMode.insensitive } },
                    ],
                };
            }

            const posts = await this.prisma.post.findMany({
                where,
                orderBy: { createdAt: 'desc' },
            });

            if (!posts || posts.length === 0) {
                throw new Error('Không tìm thấy bài viết nào.');
            }

            return posts;
        } catch (error) {
            console.error('Lỗi khi lấy danh sách bài viết public:', error);
            throw error;
        }
    }

    async createPost(userId: number, input: CreatePostInput) {
        try {
            if (input.categoryId <= 0) {
                throw new Error("categoryId phải là một giá trị hợp lệ.");
            }

            const post = await this.prisma.post.create({
                data: {
                    title: input.title,
                    summary: input.summary || null,
                    content: input.content,
                    categoryId: input.categoryId,
                    isPublic: input.isPublic || false,
                    isDraft: input.isDraft || false,
                    userId: userId,
                },
                select: {
                    id: true,
                    title: true,
                    summary: true,
                    content: true,
                    isPublic: true,
                    isDraft: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!post) {
                throw new Error('Không thể tạo bài viết.');
            }
            logger.info(`Bài viết mới đã được tạo với ID: ${post.id}`);

            return post;
        } catch (error) {
            console.error(error);
            throw new Error('Tạo bài viết thất bại');
        }
    }
}

export default new PostService();
