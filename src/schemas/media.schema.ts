import { FastifySchema } from 'fastify';

export const errorResponseSchema: FastifySchema = {
  body: {
    type: 'object',
    properties: {
      statusCode: { type: 'number' },
      message: { type: 'string' },
      error: { type: 'string' },
    },
  },
};

export const uploadMediaSchema: FastifySchema = {
  summary: 'Tải lên media',
  tags: ['Media'],
  consumes: ['multipart/form-data'],
  body: {
    type: 'object',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
        description: 'File media tải lên',
      },
    },
    required: ['file'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            media: {
              type: 'object',
              properties: {
                url: { type: 'string' },
              },
            },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};
