import { logger } from '@config/index';
import { Gender, PrismaClient } from '@prisma/client';
import {
  checkEmail,
  createUser,
  login,
  saveEmailVerificationToken,
  sendEmail,
  verifyEmailToken,
} from '@services/index';
import { getVerificationEmail } from '@utils/index';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
export const prisma = new PrismaClient();

class AuthController {
  async registerUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName, birthDate, gender } = request.body as {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        birthDate: string;
        gender: number;
      };

      if (password.length < 8) return reply.badRequest('Mật khẩu phải có ít nhất 8 ký tự.');
      if (password.length > 16) return reply.badRequest('Mật khẩu không được vượt quá 16 ký tự.');

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,16}$/;
      if (!passwordRegex.test(password)) {
        return reply.badRequest('Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường và một ký tự đặc biệt.');
      }

      const genderEnum: Gender = gender === 0 ? Gender.MALE : gender === 1 ? Gender.FEMALE : Gender.OTHER;

      if (await checkEmail(email)) {
        return reply.badRequest('Email đã được sử dụng.');
      }

      const newUser = await createUser({
        email,
        password,
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        gender: genderEnum,
      });

      if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not defined');

      const emailVerificationToken = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
      const verificationTokenExpires = dayjs().add(24, 'hour').toDate();

      await saveEmailVerificationToken(newUser.id, emailVerificationToken, verificationTokenExpires);

      const { subject, text } = getVerificationEmail(newUser.firstName, emailVerificationToken);
      const emailResult = await sendEmail(newUser.email, subject, text);

      if (!emailResult.success) return reply.internalError('Không thể gửi email xác thực.');

      return reply.created({
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isActive: newUser.isActive,
        },
      });
    } catch (error) {
      logger.error('Lỗi register', error);
      return reply.internalError();
    }
  }

  async verifyEmailController(request: FastifyRequest<{ Querystring: { token: string } }>, reply: FastifyReply) {
    try {
      const { token } = request.query;
      const result = await verifyEmailToken(token);

      if (result.success) return reply.ok({ message: result.message });

      return reply.badRequest(result.message);
    } catch (error) {
      logger.error('Lỗi verifying email:', error);
      return reply.internalError();
    }
  }

  async loginHandler(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };

      const { accessToken, refreshToken } = await login({ email, password });

      return reply.ok({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error.message === 'Email không tồn tại') {
        return reply.notFound(error.message);
      }
      if (error.message === 'Tài khoản chưa được kích hoạt') {
        return reply.badRequest(error.message);
      }
      if (error.message === 'Mật khẩu không chính xác') {
        return reply.unauthorized(error.message);
      }

      logger.error('Lối controller login', error);
      return reply.internalError();
    }
  }
}

export default new AuthController();
