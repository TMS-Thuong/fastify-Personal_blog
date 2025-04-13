import { FastifySchema } from 'fastify';
import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID phải là số'),
});

export const CreateCategoryBody = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  description: z.string().optional(),
});

export const UpdateCategoryBody = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  description: z.string().optional(),
});
export const GetPostsByCategoryQuery = z.object({
  search: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategoryBody>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategoryBody>;
export type GetPostsByCategoryQuery = z.infer<typeof GetPostsByCategoryQuery>;

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
};

const userObjectSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    email: { type: 'string' },
    firstName: { type: 'string' },
    lastName: { type: 'string' },
    birthDate: { type: 'string', format: 'date' },
    gender: { type: 'string' },
    address: { type: 'string' },
    avatarUrl: { type: 'string' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
};

export const getUsersSchema: FastifySchema = {
  summary: 'Lấy danh sách người dùng (Admin)',
  tags: ['Admin'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            users: {
              type: 'array',
              items: userObjectSchema,
            },
          },
        },
      },
    },
    500: errorResponseSchema,
  },
};

export const getUserByIdResponseSchema: FastifySchema = {
  summary: 'Lấy danh sách người dùng theo id',
  tags: ['Admin'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          properties: {
            user: userObjectSchema,
          },
        },
      },
    },
    404: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const getDashboardStatsResponseSchema: FastifySchema = {
  summary: ' Lấy thống kê tổng quan (Admin)',
  tags: ['Admin'],
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        data: {
          type: 'object',
          required: ['stats'],
          properties: {
            stats: {
              type: 'object',
              required: ['totalUsers', 'totalPosts', 'totalComments', 'totalCategories', 'totalMedia'],
              properties: {
                totalUsers: { type: 'number' },
                totalPosts: { type: 'number' },
                totalComments: { type: 'number' },
                totalCategories: { type: 'number' },
                totalMedia: { type: 'number' },
              },
            },
          },
        },
      },
      required: ['success', 'data'],
    },
    404: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const CreateCategorySchema: FastifySchema = {
  summary: 'Tạo danh mục',
  tags: ['Admin'],
  body: {
    type: 'object',
    required: ['name', 'description'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
    },
  },
  response: {
    201: {
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const UpdateCategorySchema: FastifySchema = {
  summary: 'Cập nhật danh mục',
  tags: ['Admin'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    required: ['name'],
    properties: {
      name: { type: 'string' },
      description: { type: 'string' },
    },
  },
  response: {
    200: {
      description: 'Cập nhật thành công',
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            description: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const DeleteCategorySchema: FastifySchema = {
  summary: 'Xóa danh mục',
  tags: ['Admin'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'integer' },
    },
  },
  response: {
    200: {
      description: 'Xóa thành công danh mục',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
    400: errorResponseSchema,
    401: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};
