import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';

export async function swagger(fastify: FastifyInstance) {
  fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Fastify Blog API',
        description: 'API documentation for the Fastify Blog',
        version: '1.0.0',
      },
      servers: [{ url: 'http://localhost:3000' }],
    },
  });

  fastify.register(fastifySwaggerUI, {
    routePrefix: '/api/docs',
  });
}
