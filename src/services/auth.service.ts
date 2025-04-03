import { logger } from '@config/index';
import { Gender, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  logger.error('JWT_SECRET is not defined in the environment variables');
  throw new Error('JWT_SECRET is required');
}

interface JwtPayload {
  email: string;
}

export const checkEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
}) => {
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  return prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      birthDate: userData.birthDate,
      gender: userData.gender,
      verificationToken: `${Date.now()}-${Math.random()}`,
      isActive: false,
    },
  });
};

export const saveEmailVerificationToken = async (userId: number, token: string, expiresAt: Date) => {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
        verificationTokenExpires: expiresAt,
      },
    });
  } catch (error) {
    logger.error('Lỗi khi lưu token xác thực:', error);
    throw new Error('Không thể lưu token xác thực');
  }
};

export const verifyEmailToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const user = await prisma.user.findUnique({
      where: { email: (decoded as JwtPayload).email },
    });

    if (!user) {
      return { success: false, message: 'Người dùng không tồn tại.' };
    }

    if (dayjs().isAfter(dayjs(user.verificationTokenExpires))) {
      return { success: false, message: 'Token đã hết hạn.' };
    }

    if (user.verificationToken !== token) {
      return { success: false, message: 'Token không hợp lệ.' };
    }

    await prisma.user.update({
      where: { email: (decoded as any).email },
      data: { isActive: true },
    });

    return { success: true, message: 'Tài khoản đã được kích hoạt.' };
  } catch (error) {
    logger.error('Lỗi khi xác thực token:', error);
    return { success: false, message: 'Token không hợp lệ hoặc đã hết hạn.' };
  }
};
