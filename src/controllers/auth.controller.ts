import { logger } from '@config/index';
import { Gender } from '@prisma/client';
import AuthService from '@services/auth.service';
import EmailService from '@services/email.service';
import { getResetPasswordEmail, getVerificationEmail } from '@utils/index';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

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

      if (await AuthService.checkEmail(email)) {
        return reply.badRequest('Email đã được sử dụng.');
      }

      const newUser = await AuthService.createUser({
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

      await AuthService.saveEmailVerificationToken(newUser.id, emailVerificationToken, verificationTokenExpires);

      const { subject, text } = getVerificationEmail(newUser.firstName, emailVerificationToken);
      const emailResult = await EmailService.sendEmail(newUser.email, subject, text);

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
      const result = await AuthService.verifyEmailToken(token);

      if (result.success) return reply.ok({ message: result.message });

      return reply.badRequest(result.message);
    } catch (error) {
      logger.error('Lỗi verifying email:', error);
      return reply.internalError();
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };
      console.log('email', email, password);

      const { accessToken, refreshToken } = await AuthService.login({ email, password });
      console.log('accessToken', accessToken, refreshToken);

      return reply.ok({
        accessToken,
        refreshToken,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Email không tồn tại') {
          return reply.notFound(error.message);
        }
        if (error.message === 'Tài khoản chưa được kích hoạt') {
          return reply.badRequest(error.message);
        }
        if (error.message === 'Mật khẩu không chính xác') {
          return reply.unauthorized(error.message);
        }
      }

      logger.error('Lỗi controller login', error);
      return reply.internalError('Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại sau.');
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { refreshToken } = request.body as { refreshToken: string };

      if (!refreshToken) {
        return reply.badRequest('Thiếu refresh token');
      }

      const result = await AuthService.refreshAccessToken(refreshToken);

      if (!result.success) {
        return reply.unauthorized(result.message);
      }

      return reply.ok({ accessToken: result.accessToken });
    } catch (error) {
      request.log.error('Lỗi refresh token:', error);
      return reply.internalError();
    }
  }

  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    const { email } = request.body as { email: string };

    try {
      const user = await AuthService.checkEmail(email);
      const resetToken = AuthService.createResetPasswordToken(email);
      const emailContent = getResetPasswordEmail(user.firstName, await resetToken);
      const emailResult = await EmailService.sendEmail(email, emailContent.subject, emailContent.text);

      if (!emailResult.success) {
        return reply.internalError('Gửi email thất bại');
      }

      return reply.send({ message: 'Email đặt lại mật khẩu đã được gửi.' });
    } catch (error) {
      console.error('Lỗi khi xử lý yêu cầu quên mật khẩu:', error);
      return reply.internalError('Có lỗi xảy ra trong quá trình xử lý');
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    const { token, newPassword } = request.body as { token: string; newPassword: string };
    try {
      await AuthService.resetPassword(token, newPassword);
      reply.ok({ message: 'Mật khẩu đã được cập nhật thành công' });
    } catch (error) {
      reply.badRequest(error.message);
    }
  }
}

export default new AuthController();
