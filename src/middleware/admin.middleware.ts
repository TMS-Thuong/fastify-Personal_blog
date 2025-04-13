import { FastifyJWT } from '@fastify/jwt';
import { FastifyRequest, FastifyReply } from 'fastify';

import { logger } from '@app/config';

export const adminMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    await request.jwtVerify();

    const user = request.user as FastifyJWT;
    logger.info('User:', user);
    if (!user?.isAdmin) {
      return reply.forbidden('Bạn không có quyền quản trị');
    }
  } catch {
    return reply.unauthorized('Xác thực thất bại');
  }
};
