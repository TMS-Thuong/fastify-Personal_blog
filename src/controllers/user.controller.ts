import { logger } from '@config/logger';
import UserService from '@services/user.service';
import { FastifyReply, FastifyRequest } from 'fastify';

class UserController {
  async show(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email: userEmail } = request.user as { email: string };
      const user = await UserService.getProfile(userEmail);
      const { id, email, firstName, lastName, avatarUrl, birthDate, gender } = user;
      const userData = { id, email, firstName, lastName, avatarUrl, birthDate, gender };
      logger.info('controller successfully', userData);

      return reply.ok(userData);
    } catch (error) {
      logger.error('Error retrieving user profile', error);
      return reply.badRequest(error.message);
    }
  }

  // Lấy thông tin người dùng theo ID
  async showById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const user = await UserService.getUserId(id);
      return reply.ok(user);
    } catch (error) {
      logger.error('Error retrieving user by ID', error);
      return reply.badRequest(error.message);
    }
  }
}

export default new UserController();
