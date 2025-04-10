import { JWT_SECRET } from '@config/env';
import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export const userMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return reply.unauthorized('Token không hợp lệ');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: number };
    const user = await request.server.prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, isAdmin: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return reply.unauthorized('Tài khoản không tồn tại hoặc chưa kích hoạt');
    }

    request.user = user;
    return true;
  } catch (error) {
    return reply.unauthorized('Token hết hạn hoặc không hợp lệ');
  }
};
