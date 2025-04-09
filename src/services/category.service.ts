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
}

export default new CategoryService();
