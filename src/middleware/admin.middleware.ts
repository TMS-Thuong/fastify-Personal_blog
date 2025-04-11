import { FastifyRequest, FastifyReply } from 'fastify';

export const adminMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = request.user;
  if (!user?.isAdmin) {
    return reply.forbidden('Bạn không có quyền quản trị');
  }
};
