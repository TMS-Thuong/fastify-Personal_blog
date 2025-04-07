import { FastifySchema } from 'fastify';

export const getProfileSchema: FastifySchema = {
  tags: ['User'],
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatarUrl: { type: 'string', nullable: true },
        birthDate: { type: 'string', format: 'date-time' },
        gender: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};

export const getUserByIdSchema: FastifySchema = {
  tags: ['User'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        id: { type: 'integer' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        avatarUrl: { type: 'string', nullable: true },
        birthDate: { type: 'string', format: 'date-time' },
        gender: { type: 'string' },
      },
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
};
