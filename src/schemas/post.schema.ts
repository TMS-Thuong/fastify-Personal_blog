import { PostStatus } from '@prisma/client';
import { FastifySchema } from 'fastify';
import { z } from 'zod';

export const GetPublicPostsQuery = z.object({
  search: z.string().optional(),
});

export const CreatePostBody = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  summary: z.string().nullable().optional(),
  content: z.string().min(1, 'Nội dung không được để trống'),
  categoryId: z.number({ required_error: 'Danh mục là bắt buộc' }),
  status: z.nativeEnum(PostStatus).default(PostStatus.DRAFT),
});

export const UpdatePostBody = z.object({
  title: z.string().optional(),
  summary: z.string().nullable().optional(),
  content: z.string().optional(),
  categoryId: z.number().optional(),
  status: z.nativeEnum(PostStatus).optional(),
});

export const linkPostWithMediaSchema = z.object({
  postId: z.number().int().min(1, 'ID bài viết không hợp lệ'),
  mediaIds: z.array(z.number().int().min(1)).min(1, 'Phải có ít nhất 1 mediaId'),
});

export type LinkPostWithMediaInput = z.infer<typeof linkPostWithMediaSchema>;
export type UpdatePostInput = z.infer<typeof UpdatePostBody>;
export type CreatePostInput = z.infer<typeof CreatePostBody>;

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
};

const postObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    title: { type: 'string' },
    summary: { type: 'string', nullable: true },
    content: { type: 'string' },
    status: { type: 'string', enum: ['DRAFT', 'PRIVATE', 'PUBLIC'] },
    categoryId: { type: 'number', nullable: true },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
  required: ['id', 'title', 'content', 'status', 'createdAt', 'updatedAt'],
} as const;

export const GetPublicPostsSchema: FastifySchema = {
  summary: 'Lấy danh sách bài viết/ search bài viết',
  tags: ['Posts'],
  querystring: {
    type: 'object',
    properties: {
      search: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: postObjectSchema,
        },
      },
      required: ['data'],
    },
    400: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const GetMyPostsSchema: FastifySchema = {
  summary: 'Lấy danh sách bài viết của người dùng hiện tại',
  tags: ['Posts'],
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: postObjectSchema,
        },
      },
      required: ['data'],
    },
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const CreatePostSchema: FastifySchema = {
  summary: 'Tạo bài viết mới',
  tags: ['Posts'],
  body: {
    type: 'object',
    required: ['title', 'content', 'categoryId'],
    properties: {
      title: { type: 'string' },
      summary: { type: 'string', nullable: true },
      content: { type: 'string' },
      categoryId: { type: 'number' },
      status: { type: 'string', enum: ['DRAFT', 'PRIVATE', 'PUBLIC'], default: 'DRAFT' },
    },
  },
  response: {
    201: {
      type: 'object',
      properties: {
        data: postObjectSchema,
      },
      required: ['data'],
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const updatePostSchema: FastifySchema = {
  summary: 'Cập nhật bài viết',
  tags: ['Posts'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  body: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      content: { type: 'string' },
      summary: { type: 'string', nullable: true },
      categoryId: { type: 'number' },
      status: { type: 'string', enum: ['DRAFT', 'PRIVATE', 'PUBLIC'] },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: postObjectSchema,
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

export const deletePostSchema: FastifySchema = {
  summary: 'Xóa bài viết',
  tags: ['Posts'],
  params: {
    type: 'object',
    properties: {
      id: { type: 'string' },
    },
    required: ['id'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    401: errorResponseSchema,
    403: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const linkPostWithSwaggerSchema: FastifySchema = {
  summary: 'Liên kết bài post với media',
  tags: ['Posts'],
  body: {
    type: 'object',
    properties: {
      postId: { type: 'integer', minimum: 1 },
      mediaIds: {
        type: 'array',
        items: { type: 'integer', minimum: 1 },
        minItems: 1,
      },
    },
  },
  response: {
    200: {
      type: 'object',
      required: ['success', 'data'],
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          required: ['message', 'media'],
          properties: {
            message: { type: 'string' },
            media: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'url', 'type'],
                properties: {
                  id: { type: 'integer' },
                  url: { type: 'string' },
                  type: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    403: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const removeMediaFromPostSchema = {
  params: {
    type: 'object',
    properties: {
      postId: { type: 'number', minimum: 1 },
    },
    required: ['postId'],
  },
  body: {
    type: 'object',
    properties: {
      mediaIds: {
        type: 'array',
        items: { type: 'number', minimum: 1 },
        minItems: 1,
      },
    },
    required: ['mediaIds'],
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
    500: errorResponseSchema,
  },
};
