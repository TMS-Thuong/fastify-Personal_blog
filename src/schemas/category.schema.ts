import { FastifySchema } from 'fastify';
import { z } from 'zod';

export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID phải là số'),
});

// export const CreateCategoryBody = z.object({
//   name: z.string().min(1, 'Tên danh mục không được để trống'),
//   description: z.string().optional(),
// });

// export const UpdateCategoryBody = z.object({
//   name: z.string().min(1, 'Tên danh mục không được để trống'),
//   description: z.string().optional(),
// });
export const GetPostsByCategoryQuery = z.object({
  search: z.string().optional(),
});

// export type CreateCategoryInput = z.infer<typeof CreateCategoryBody>;
// export type UpdateCategoryInput = z.infer<typeof UpdateCategoryBody>;
export type GetPostsByCategoryQuery = z.infer<typeof GetPostsByCategoryQuery>;

const errorResponseSchema = {
  type: 'object',
  properties: {
    statusCode: { type: 'number' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
};

const categoryresponse = {
  id: { type: 'number' },
  name: { type: 'string' },
  description: { type: 'string' },
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
};

export const GetCategoriesSchema: FastifySchema = {
  summary: 'Lấy danh sách danh mục',
  tags: ['Categories'],
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: categoryresponse,
            required: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
          },
        },
      },
      required: ['data'],
    },
    500: errorResponseSchema,
  },
};

export const GetCategoryByIdSchema: FastifySchema = {
  summary: 'Lấy danh mục theo ID',
  tags: ['Categories'],
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
        statusCode: { type: 'number' },
        message: { type: 'string' },
        data: {
          type: 'object',
          properties: categoryresponse,
        },
      },
    },
    400: errorResponseSchema,
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

export const GetPostsByCategorySchema: FastifySchema = {
  summary: 'Lấy danh sách bài viết theo danh mục',
  tags: ['Categories'],
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
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
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              title: { type: 'string' },
              summary: { type: 'string', nullable: true },
              content: { type: 'string' },
              isPublic: { type: 'boolean' },
              isDraft: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  username: { type: 'string' },
                },
              },
              category: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                },
              },
            },
            required: ['id', 'title', 'content', 'isPublic', 'isDraft', 'createdAt', 'updatedAt', 'user', 'category'],
          },
        },
      },
      required: ['data'],
    },
    404: errorResponseSchema,
    500: errorResponseSchema,
  },
};

// export const CreateCategorySchema: FastifySchema = {
//   summary: 'Tạo danh mục',
//   tags: ['Admin'],
//   body: {
//     type: 'object',
//     required: ['name', 'description'],
//     properties: {
//       name: { type: 'string' },
//       description: { type: 'string' },
//     },
//   },
//   response: {
//     201: {
//       properties: {
//         data: {
//           type: 'object',
//           properties: {
//             id: { type: 'number' },
//             name: { type: 'string' },
//             description: { type: 'string' },
//             createdAt: { type: 'string', format: 'date-time' },
//             updatedAt: { type: 'string', format: 'date-time' },
//           },
//         },
//       },
//     },
//     400: errorResponseSchema,
//     401: errorResponseSchema,
//     500: errorResponseSchema,
//   },
// };

// export const UpdateCategorySchema: FastifySchema = {
//   summary: 'Cập nhật danh mục',
//   tags: ['Admin'],
//   params: {
//     type: 'object',
//     required: ['id'],
//     properties: {
//       id: { type: 'string' },
//     },
//   },
//   body: {
//     type: 'object',
//     required: ['name'],
//     properties: {
//       name: { type: 'string' },
//       description: { type: 'string' },
//     },
//   },
//   response: {
//     200: {
//       description: 'Cập nhật thành công',
//       type: 'object',
//       properties: {
//         data: {
//           type: 'object',
//           properties: {
//             id: { type: 'number' },
//             name: { type: 'string' },
//             description: { type: 'string' },
//             createdAt: { type: 'string', format: 'date-time' },
//             updatedAt: { type: 'string', format: 'date-time' },
//           },
//         },
//       },
//     },
//     400: errorResponseSchema,
//     401: errorResponseSchema,
//     404: errorResponseSchema,
//     500: errorResponseSchema,
//   },
// };

// export const DeleteCategorySchema: FastifySchema = {
//   summary: 'Xóa danh mục',
//   tags: ['Admin'],
//   params: {
//     type: 'object',
//     required: ['id'],
//     properties: {
//       id: { type: 'string' },
//     },
//   },
//   response: {
//     204: {
//       description: 'Xóa thành công',
//       type: 'null',
//     },
//     400: errorResponseSchema,
//     401: errorResponseSchema,
//     404: errorResponseSchema,
//     500: errorResponseSchema,
//   },
// };
