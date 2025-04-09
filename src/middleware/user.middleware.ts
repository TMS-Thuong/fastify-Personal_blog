import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

export const userMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
  const token = request.headers['authorization']?.split(' ')[1];
  if (!token) {
    return reply.unauthorized('Token không hợp lệ');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    request.user = { email: decoded.email };
    return true;
  } catch (error) {
    return reply.unauthorized('Token hết hạn hoặc không hợp lệ');
  }
};
