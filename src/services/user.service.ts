import { logger } from '@config/logger';
import { PrismaClient } from '@prisma/client';

class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getProfile(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    logger.info('User profile retrieved successfully', user);
    if (!user) {
      throw new Error('User không tồn tại');
    }
    return user;
  }

  async getUserId(id: string) {
    const userId = parseInt(id, 10);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error('User không tồn tại');
    }
    return user;
  }
}

export default new UserService();
