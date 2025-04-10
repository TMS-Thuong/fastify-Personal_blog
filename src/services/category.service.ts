import { logger } from '@app/config';
import { CreateCategoryInput, GetPostsByCategoryQuery, UpdateCategoryInput } from '@app/schemas/category.schema';
import { Prisma, PrismaClient } from '@prisma/client';

class CategoryService {
    private prisma = new PrismaClient();

    async getAllCategories() {
        try {
            const categories = await this.prisma.category.findMany();
            if (!categories || categories.length === 0) {
                throw new Error('Không có danh mục nào');
            }
            return categories;
        } catch (error) {
            throw new Error(error.message || 'Lỗi lấy danh sách danh mục');
        }
    }

    async getCategoryById(id: number) {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id },
            });

            if (!category) {
                throw new Error('Danh mục không tồn tại');
            }

            return category;
        } catch (error) {
            logger.error('Lỗi khi lấy category:', error);
            throw error;
        }
    }

    async getPostsByCategory(categoryId: number, query: GetPostsByCategoryQuery, userId: number) {
        try {
            const category = await this.prisma.category.findUnique({
                where: { id: categoryId },
            });

            if (!category) {
                throw new Error('Danh mục không tồn tại');
            }

            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { isAdmin: true }
            });

            const isAdmin = user?.isAdmin || false;

            const filter: Prisma.PostWhereInput = {
                categoryId,
            };

            // Nếu là admin, hiển thị tất cả bài viết trong danh mục
            // Nếu không phải admin, chỉ hiển thị bài viết công khai hoặc bài viết của chính họ
            if (!isAdmin) {
                filter.OR = [
                    { isPublic: true, isDraft: false },
                    { userId: userId }
                ];
            }

            if (query.search) {
                filter.AND = [{
                    OR: [
                        { title: { contains: query.search, mode: 'insensitive' } },
                        { content: { contains: query.search, mode: 'insensitive' } },
                        { summary: { contains: query.search, mode: 'insensitive' } }
                    ]
                }]; 
            }

            const posts = await this.prisma.post.findMany({
                where: filter,
                select: {
                    id: true,
                    title: true,
                    summary: true,
                    content: true,
                    isPublic: true,
                    isDraft: true,
                    createdAt: true,
                    updatedAt: true,
                    userId: true,
                    user: { select: { id: true, firstName: true, lastName: true } },
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            });

            return posts.map(post => ({
                ...post,
                createdAt: post.createdAt.toISOString(),
                updatedAt: post.updatedAt.toISOString(),
                isOwner: post.userId === userId
            }));
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Lấy danh sách bài viết theo danh mục thất bại');
        }
    }

    async createCategory(input: CreateCategoryInput) {
        try {
            const newCategory = await this.prisma.category.create({
                data: {
                    name: input.name,
                    description: input.description || null,
                },
            });
            return newCategory;
        } catch (error) {
            throw new Error('Tạo danh mục thất bại');
        }
    }

    async updateCategory(id: number, input: UpdateCategoryInput) {
        try {
            const existingCategory = await this.prisma.category.findUnique({
                where: { id },
            });

            if (!existingCategory) {
                throw new Error('Danh mục không tồn tại');
            }

            logger.info(`Cập nhật danh mục ID ${id} với dữ liệu: ${JSON.stringify(input)}`);

            const updatedCategory = await this.prisma.category.update({
                where: { id },
                data: {
                    name: input.name,
                    description: input.description || null,
                },
            });

            logger.info(`Danh mục đã được cập nhật: ${JSON.stringify(updatedCategory)}`);
            return updatedCategory;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Cập nhật danh mục thất bại');
        }
    }

    async deleteCategory(id: number) {
        try {
            const categoryWithPosts = await this.prisma.category.findUnique({
                where: { id },
                include: {
                    posts: {
                        select: { id: true },
                        take: 1,
                    },
                },
            });

            if (!categoryWithPosts) {
                throw new Error('Danh mục không tồn tại');
            }

            if (categoryWithPosts.posts && categoryWithPosts.posts.length > 0) {
                throw new Error('Danh mục đang được sử dụng nên không thể xóa');
            }

            logger.info(`Xóa danh mục ID ${id}`);

            await this.prisma.category.delete({
                where: { id },
            });

            logger.info(`Danh mục ID ${id} đã được xóa thành công`);
            return true;
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Xóa danh mục thất bại');
        }
    }
}

export default new CategoryService();
