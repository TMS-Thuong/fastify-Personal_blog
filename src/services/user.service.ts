import { logger } from '@config/logger';
import { PrismaClient, Gender, Prisma } from '@prisma/client';

import bcrypt from 'bcrypt';
type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  birthDate?: string | Date;
  gender?: Gender;
  address?: string;
};

class UserService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }
  async getUserById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new Error('User không tồn tại');
    }
    return user;
  }

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
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

  async updateAvatar(id: number, avatarUrl: string) {
    return this.prisma.user.update({
      where: { id },
      data: { avatarUrl },
    });
  }

  async updateUser( id: number, userData: Partial<UpdateUserInput>) {
    const updateData: Prisma.UserUpdateInput = {
      updatedAt: new Date(),
    };

    if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
    if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
    if (userData.avatarUrl !== undefined) updateData.avatarUrl = userData.avatarUrl;
    if (userData.gender !== undefined) updateData.gender = userData.gender;
    if (userData.address !== undefined) updateData.address = userData.address;
    if (userData.birthDate !== undefined) {
      updateData.birthDate = new Date(userData.birthDate);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        birthDate: true,
        gender: true,
        address: true,
        avatarUrl: true,
      },
    });

    logger.info('User updated successfully', updatedUser);
    return updatedUser;
  }

  async updatePassword(id: number, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: {
          password: hashedPassword,
        },
      });

      logger.info('Password updated successfully', updatedUser);
      return updatedUser;
    } catch (error) {
      logger.error('Error updating password', error);
      throw new Error('Có lỗi xảy ra khi cập nhật mật khẩu');
    }
  }

}

export default new UserService();
