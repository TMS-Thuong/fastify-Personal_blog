import { logger } from '@config/index';
import AuthService from '@services/auth.service';
import EmailService from '@services/email.service';
import { getResetPasswordEmail, getVerificationEmail } from '@utils/index';
import dayjs from 'dayjs';
import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import {
  registerUserZodSchema,
  verifyEmailZodSchema,
  loginZodSchema,
  refreshTokenZodSchema,
  forgotPasswordZodSchema,
  resetPasswordZodSchema
} from '@schemas/auth.schema';
import { binding } from '@decorator/binding';

class AuthController {
  @binding
  async registerUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validationResult = registerUserZodSchema.safeParse(request.body);

      if (!validationResult.success) {
        const errors = validationResult.error.errors;
        const emailOrPasswordError = errors.find(err =>
          err.path.includes('email') || err.path.includes('password')
        );

        if (emailOrPasswordError) {
          return reply.badRequest(emailOrPasswordError.message);
        }

      }

      const { email, password, firstName, lastName, birthDate, gender } = validationResult.success
        ? validationResult.data
        : request.body as any;

      if (!email || !password) {
        return reply.badRequest('Email và mật khẩu là bắt buộc.');
      }

      if (await AuthService.checkEmail(email)) {
        return reply.badRequest('Email đã được sử dụng.');
      }

      const newUser = await AuthService.createUser({
        email,
        password,
        firstName: firstName || '',
        lastName: lastName || '',
        birthDate: birthDate ? new Date(birthDate) : undefined,
        gender: gender || 'OTHER',
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

  @binding
  async verifyEmailController(request: FastifyRequest<{ Querystring: { token: string } }>, reply: FastifyReply) {
    try {
      const validationResult = verifyEmailZodSchema.safeParse({ token: request.query.token });

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Token không hợp lệ';
        return reply.badRequest(errorMessage);
      }

      const { token } = validationResult.data;
      const verifyResult = await AuthService.verifyEmailToken(token);

      if (verifyResult.success) return reply.ok({ message: verifyResult.message });
      return reply.badRequest(verifyResult.message);
    } catch (error) {
      logger.error('Lỗi verifying email:', error);
      return reply.internalError();
    }
  }

  @binding
  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validationResult = loginZodSchema.safeParse(request.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Dữ liệu đăng nhập không hợp lệ';
        return reply.badRequest(errorMessage);
      }

      const { email, password } = validationResult.data;
      const { accessToken, refreshToken } = await AuthService.login({ email, password });

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

  @binding
  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validationResult = refreshTokenZodSchema.safeParse(request.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Refresh token không hợp lệ';
        return reply.badRequest(errorMessage);
      }

      const { refreshToken } = validationResult.data;
      const refreshResult = await AuthService.refreshAccessToken(refreshToken);

      if (!refreshResult.success) {
        return reply.unauthorized(refreshResult.message);
      }

      return reply.ok({ accessToken: refreshResult.accessToken });
    } catch (error) {
      request.log.error('Lỗi refresh token:', error);
      return reply.internalError();
    }
  }

  @binding
  async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validationResult = forgotPasswordZodSchema.safeParse(request.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Email không hợp lệ';
        return reply.badRequest(errorMessage);
      }

      const { email } = validationResult.data;
      const user = await AuthService.checkEmail(email);

      if (!user) {
        return reply.send({ message: 'Email đặt lại mật khẩu đã được gửi (nếu email tồn tại).' });
      }

      const resetToken = await AuthService.createResetPasswordToken(email);
      const emailContent = getResetPasswordEmail(user.firstName, resetToken);
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

  @binding
  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const validationResult = resetPasswordZodSchema.safeParse(request.body);

      if (!validationResult.success) {
        const errorMessage = validationResult.error.errors[0]?.message || 'Dữ liệu không hợp lệ';
        return reply.badRequest(errorMessage);
      }

      const { token, newPassword } = validationResult.data;
      await AuthService.resetPassword(token, newPassword);

      reply.ok({ message: 'Mật khẩu đã được cập nhật thành công' });
    } catch (error) {
      reply.badRequest(error.message);
    }
  }
}

export default new AuthController();