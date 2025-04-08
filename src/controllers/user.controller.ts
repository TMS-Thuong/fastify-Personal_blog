import { logger } from '@config/logger';
import UserService from '@services/user.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { saveAvatarFile } from '@utils/upload.utils';
import { binding } from '@decorator/binding';
import bcrypt from 'bcrypt';

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class UserController {
  @binding
  async profile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email: userEmail } = request.user as { email: string };
      const user = await UserService.getProfile(userEmail);
      const { id, email, firstName, lastName, avatarUrl, birthDate, gender } = user;
      const userData = { id, email, firstName, lastName, avatarUrl, birthDate, gender };
      return reply.ok(userData);
    } catch (error) {
      logger.error('Không thể lấy thông tin', error);
      return reply.badRequest(error.message);
    }
  }

  @binding
  async showUserById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await UserService.getUserId(id);
      const { email, firstName, lastName, avatarUrl, birthDate, gender, address } = user;
      const userData = { id, email, firstName, lastName, avatarUrl, birthDate, gender, address };
      return reply.ok(userData);
    } catch (error) {
      logger.error('Không thể lấy thông tin', error);
      return reply.badRequest(error.message);
    }
  }

  @binding
  async updateAvatar(request: FastifyRequest, reply: FastifyReply) {
    try {
      const email = (request.user as { email: string }).email;

      const data = await request.file();
      console.log('file' + data);


      if (!data) {
        return reply.badRequest('Không có file upload');
      }

      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];

      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.badRequest('Định dạng file không hợp lệ. Chỉ chấp nhận PNG, JPG, JPEG');
      }

      logger.info(`File uploaded: ${data.filename}`);

      const { url: avatarUrl } = await saveAvatarFile(data, email);

      await UserService.updateAvatar(email, avatarUrl);

      return reply.ok({
        message: 'Cập nhật avatar thành công',
        avatarUrl,
      });
    } catch (error) {
      return reply.internalError(error.message);
    }
  }


  @binding
  async editProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const email = (request.user as { email: string }).email;
      const userData = request.body;

      const updatedUser = await UserService.updateUser(email, userData);
      const { firstName, lastName, birthDate, gender, address } = updatedUser;

      return reply.ok({
        message: 'Thông tin đã được cập nhật!',
        data: { firstName, lastName, birthDate, gender, address },
      });

    } catch (error) {
      return reply.internalError('Có lỗi xảy ra khi cập nhật thông tin.');
    }
  }

  @binding
  async editPassword(request: FastifyRequest, reply: FastifyReply) {
    const { currentPassword, newPassword } = request.body as ChangePasswordRequest;
    const email = (request.user as { email: string }).email;

    try {
      const user = await UserService.getUserByEmail(email);

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return reply.unauthorized('Mật khẩu cũ không chính xác');
      }

      if (newPassword.length < 8) {
        return reply.badRequest('Mật khẩu mới phải có ít nhất 8 ký tự');
      }
      if (newPassword.length > 16) {
        return reply.badRequest('Mật khẩu mới không được vượt quá 16 ký tự');
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,16}$/;
      if (!passwordRegex.test(newPassword)) {
        return reply.badRequest('Mật khẩu mới phải chứa ít nhất một chữ hoa, một chữ thường và một ký tự đặc biệt');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updatedUser = await UserService.updatePassword(email, hashedPassword);

      return reply.ok({
        message: 'Mật khẩu đã được thay đổi thành công!',
      });
    } catch (error) {
      return reply.internalError('Có lỗi xảy ra khi đổi mật khẩu');
    }
  }
}

export default new UserController();
