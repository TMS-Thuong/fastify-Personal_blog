import prisma from '@app/plugins/prisma';
import { logger } from '@config/logger';
import { PrismaClient, Gender } from '@prisma/client';

import bcrypt from 'bcrypt';
import { format as dateFnsFormat } from 'date-fns-tz';
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
  async getUserByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new Error('User không tồn tại');
    }
    return user;
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

  async updateAvatar(email: string, avatarUrl: string) {
    return this.prisma.user.update({
      where: { email },
      data: { avatarUrl },
    });
  }

  async updateUser(email: string, userData: UpdateUserInput) {
    const { firstName, lastName, avatarUrl, birthDate, gender, address } = userData;

    const vietnamTimeZone = 'Asia/Ho_Chi_Minh';
    const vietnamTime = dateFnsFormat(new Date(), 'yyyy-MM-dd HH:mm:ss', { timeZone: vietnamTimeZone });
    const vietnamDate = new Date(vietnamTime);

    logger.info('Vietnam time:', vietnamDate);

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: {
        firstName,
        lastName,
        avatarUrl,
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender,
        address,
        updatedAt: vietnamDate,
      },
    });

    logger.info("db", updatedUser);
    return updatedUser;
  }

  async updatePassword(email: string, newPassword: string) {
    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await this.prisma.user.update({
        where: { email },
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
