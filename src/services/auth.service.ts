import { logger } from '@config/index';
import { PrismaClient, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  logger.error('JWT_SECRET is not defined in the environment variables');
  throw new Error('JWT_SECRET is required');
}

export interface JwtPayload {
  email: string;
}

export interface LoginData {
  email: string;
  password: string;
}

class AuthService {
  async checkEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate: Date;
    gender: Gender;
  }) {
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
  }

  async saveEmailVerificationToken(userId: number, token: string, expiresAt: Date) {
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
  }

  async verifyEmailToken(token: string) {
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
  }

  async comparePassword(password: string, hashedPassword: string) {
    return await bcrypt.compare(password, hashedPassword);
  }

  async login({ email, password }: LoginData) {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Email không tồn tại');
      }

      if (!user.isActive) {
        throw new Error('Tài khoản chưa được kích hoạt');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new Error('Mật khẩu không chính xác');
      }

      const accessToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, {
        expiresIn: '2h',
      });

      const refreshToken = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET as string, {
        expiresIn: '7d',
      });

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Login service error:', error);
      throw error;
    }
  }

  generateToken(payload: JwtPayload) {
    return jwt.sign(payload, jwtSecret, { expiresIn: '2h' });
  }
}

export default new AuthService();
