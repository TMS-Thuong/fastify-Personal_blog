import { JWT_SECRET, logger } from '@config/index';
import { PrismaClient, Gender, User } from '@prisma/client';
import bcrypt from 'bcrypt';
import dayjs from 'dayjs';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  email: string;
  isAdmin: boolean;
  userId: number;
  firstName?: string;
  lastName?: string;
  birthDate?: Date;
  iat?: number;
  exp?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

type UserData = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: Date;
  gender: Gender;
};

class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtSecret = JWT_SECRET;

    if (!this.jwtSecret) {
      logger.error('JWT_SECRET is not defined in the environment variables');
      throw new Error('JWT_SECRET is required');
    }
  }

  async checkEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async createUser(userData: UserData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    return this.prisma.user.create({
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
      await this.prisma.user.update({
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
      const decoded = jwt.verify(token, this.jwtSecret) as JwtPayload;

      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email },
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

      await this.prisma.user.update({
        where: { email: decoded.email },
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
      const user = await this.prisma.user.findUnique({
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

      const accessToken = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.isAdmin }, this.jwtSecret, {
        expiresIn: '2h',
      });

      const refreshToken = jwt.sign({ userId: user.id, email: user.email, isAdmin: user.isAdmin }, this.jwtSecret, {
        expiresIn: '7d',
      });

      return { accessToken, refreshToken };
    } catch (error) {
      logger.error('Login service error:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtSecret) as JwtPayload & { userId: number };

      const user = await this.prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || !user.isActive) {
        return { success: false, message: 'Người dùng không hợp lệ hoặc chưa kích hoạt' };
      }

      const newAccessToken = jwt.sign({ userId: user.id, email: user.email }, this.jwtSecret, { expiresIn: '2h' });

      return { success: true, accessToken: newAccessToken };
    } catch (error) {
      logger.error('Lỗi xác thực refresh token:', error);
      return { success: false, message: 'Refresh token không hợp lệ hoặc đã hết hạn' };
    }
  }

  async createResetPasswordToken(email: string): Promise<string> {
    return jwt.sign({ email }, JWT_SECRET, { expiresIn: '30m' });
  }

  async generateToken(payload: JwtPayload) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: '2h' });
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { email: string };
      const { email } = decoded;

      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new Error('Người dùng không tồn tại');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      });

      return true;
    } catch {
      throw new Error('Token không hợp lệ hoặc đã hết hạn');
    }
  }
}

export default new AuthService();
