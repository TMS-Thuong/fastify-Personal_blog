import { FastifyRequest } from 'fastify';

export type AuthenticatedRequest = FastifyRequest & {
  user: {
    id: number;
    email: string;
    isAdmin: boolean;
  };
};
