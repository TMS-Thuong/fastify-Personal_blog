import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUI from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';

export async function swagger(fastify: FastifyInstance) {
  fastify.register(fastifySwagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Fastify Blog API',
        description: 'API documentation for the Fastify Blog',
        version: '1.0.0',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
      security: [{ BearerAuth: [] }],
      tags: [
        { name: 'Auth', description: 'Authentication and Authorization' },
        { name: 'User', description: 'User Profile ' },
        { name: 'Posts', description: 'Blog Post' },
        { name: 'Comments', description: 'Comment Blog' },
        { name: 'Categories', description: 'Category ' },
      ],
    },
  });

  fastify.register(fastifySwaggerUI, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });
}
