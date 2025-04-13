import { FastifyInstance, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

export default fp(async (fastify: FastifyInstance) => {
  fastify.decorateReply('badRequest', function (this: FastifyReply, message: string) {
    return this.status(400).send({ error: true, message });
  });

  fastify.decorateReply('unauthorized', function (this: FastifyReply, message: string) {
    return this.status(401).send({ error: true, message });
  });

  fastify.decorateReply('forbidden', function (this: FastifyReply, message: string) {
    return this.status(403).send({ error: true, message });
  });

  fastify.decorateReply('notFound', function (this: FastifyReply, message: string) {
    return this.status(404).send({ error: true, message });
  });

  fastify.decorateReply('internalError', function (this: FastifyReply, message = 'Lỗi hệ thống') {
    return this.status(500).send({ error: true, message });
  });

  fastify.decorateReply('ok', function (this: FastifyReply, data?: unknown) {
    return this.status(200).send({ success: true, data });
  });

  fastify.decorateReply('created', function (this: FastifyReply, data: unknown) {
    return this.status(201).send({ success: true, data });
  });
});

declare module 'fastify' {
  interface FastifyReply {
    badRequest(message: string): FastifyReply;
    unauthorized(message: string): FastifyReply;
    forbidden(message: string): FastifyReply;
    notFound(message: string): FastifyReply;
    internalError(message?: string): FastifyReply;
    ok<T = unknown>(data?: T): FastifyReply;
    created<T = unknown>(data: T): FastifyReply;
  }
}
