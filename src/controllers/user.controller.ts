import { logger } from '@config/logger';
import UserService from '@services/user.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import { saveAvatarFile } from '@app/utils/avatar-upload.utils';
import { binding } from '@decorator/binding';
import bcrypt from 'bcrypt';
import {
  UpdateUserInput,
  UpdatePasswordInput
} from '@schemas/user.schema';

class UserController {
  @binding
  async profile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.user as { id: number };
      const user = await UserService.getProfile(id);
      const { id: userId, email, firstName, lastName, avatarUrl, birthDate, gender, } = user;
      const userData = { id: userId, email, firstName, lastName, avatarUrl, birthDate, gender, };

      return reply.ok(userData);
    } catch (error) {
      logger.error('Không thể lấy thông tin người dùng', error);
      return reply.badRequest(error.message);
    }
  }


  @binding
  async showUserById(
    request: FastifyRequest<{
      Params: { id: string }
    }>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
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
      const id = (request.user as { id: number }).id;
      const data = await request.file();

      if (!data) {
        return reply.badRequest('Không có file upload');
      }

      const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedMimeTypes.includes(data.mimetype)) {
        return reply.badRequest('Định dạng file không hợp lệ. Chỉ chấp nhận PNG, JPG, JPEG');
      }

      logger.info(`File uploaded: ${data.filename}`);
      const { url: avatarUrl } = await saveAvatarFile(data);
      await UserService.updateAvatar(id, avatarUrl);
      logger.info('Cập nhật avatar thành công', { avatarUrl });
      return reply.ok({ avatar: avatarUrl });
    } catch (error) {
      return reply.internalError(error.message);
    }
  }

  @binding
  async editProfile(request: FastifyRequest<{ Body: UpdateUserInput }>, reply: FastifyReply) {
    try {
      const { id } = request.user as { id: number };
      const userData = request.body;

      if (Object.keys(userData).length === 0) {
        return reply.badRequest('Phải có ít nhất một trường để cập nhật');
      }

      const updatedUser = await UserService.updateUser(id, userData);
      logger.info('Cập nhật thông tin người dùng thành công', updatedUser);

      const response = {
        message: 'Thông tin đã được cập nhật!',
        data: updatedUser,
      };
      logger.info('Final response object:', JSON.stringify(response));

      return reply.ok(updatedUser);
    } catch (error) {
      request.log.error(error, 'Lỗi cập nhật thông tin người dùng');
      return reply.internalError(error.message);
    }
  }

  @binding
  async editPassword(
    request: FastifyRequest<{ Body: UpdatePasswordInput }>,
    reply: FastifyReply
  ) {
    try {
      const { currentPassword, newPassword } = request.body;
      const { id } = request.user as { id: number };

      const user = await UserService.getUserById(id);
      const isMatch = await bcrypt.compare(currentPassword, user.password);

      if (!isMatch) {
        return reply.unauthorized('Mật khẩu cũ không chính xác');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await UserService.updatePassword(id, hashedPassword);

      return reply.ok({
        message: 'Mật khẩu đã được thay đổi thành công!',
      });
    } catch (error) {
      return reply.internalError(error.message);
    }
  }

}

export default new UserController();