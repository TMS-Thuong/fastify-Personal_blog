import { logger } from '@app/config';
import { CreateCategoryInput } from '@app/schemas/category.schema';
import { PrismaClient } from '@prisma/client';

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
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new Error('Danh mục không tồn tại');
        }
        return category;
    }

    async createCategory(input: CreateCategoryInput) {
        try {
            logger.info(`Tạo danh mục với dữ liệu: ${JSON.stringify(input)}`);
            // const categories = await this.prisma.category.findMany();
            // console.log('Danh sách danh mục hiện tại trong cơ sở dữ liệu:', categories);
            const newCategory = await this.prisma.category.create({
                data: {
                    name: input.name,
                    description: input.description || null,
                },
            });
            logger.info(`Danh mục đã được tạo: ${JSON.stringify(newCategory)}`);
            return newCategory;
        } catch (error) {
            throw new Error('Tạo danh mục thất bại');
        }
    }

}

export default new CategoryService();
