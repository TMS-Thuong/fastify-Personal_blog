import { FastifySchema } from 'fastify';
import { z } from 'zod';

export const commentObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    userId: { type: 'number' },
    postId: { type: 'number' },
    content: { type: 'string' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
  required: ['id', 'userId', 'postId', 'content', 'createdAt', 'updatedAt'],
};

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    message: { type: 'string' },
    error: { type: 'string' },
  },
  required: ['statusCode', 'message', 'error'],
};

export const createCommentInput = z.object({
  content: z.string().min(1, 'Nội dung comment không được để trống'),
});

export type CreateCommentInput = z.infer<typeof createCommentInput>;

export const CreateCommentSchema: FastifySchema = {
  summary: 'Thêm bình luận mới',
  tags: ['Comments'],
  params: {
    type: 'object',
    required: ['postId'],
    properties: {
      postId: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1 },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: commentObjectSchema,
      },
      required: ['data'],
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const GetPostCommentsSchema: FastifySchema = {
  summary: 'Lấy danh sách bình luận của bài viết',
  tags: ['Comments'],
  response: {
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const UpdateCommentSchema: FastifySchema = {
  summary: 'Cập nhật bình luận',
  tags: ['Comments'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['content'],
    properties: {
      content: { type: 'string', minLength: 1 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: commentObjectSchema,
      },
      required: ['message', 'data'],
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const DeleteCommentSchema: FastifySchema = {
  summary: 'Xóa bình luận',
  tags: ['Comments'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};
