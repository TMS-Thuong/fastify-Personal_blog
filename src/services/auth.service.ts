import { Gender, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

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
}
export default new AuthService();
