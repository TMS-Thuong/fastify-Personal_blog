import { z } from 'zod';
import { FastifySchema } from 'fastify';

export const GetPublicPostsQuery = z.object({
    search: z.string().optional(),
});

export const CreatePostBody = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống'),
    summary: z.string().nullable().optional(),
    content: z.string().min(1, 'Nội dung không được để trống'),
    categoryId: z.number({ required_error: 'Danh mục là bắt buộc' }),
    isPublic: z.boolean().default(false),
    isDraft: z.boolean().default(false),
});

export type CreatePostInput = z.infer<typeof CreatePostBody>;

const errorResponseSchema = {
    type: 'object',
    properties: {
        statusCode: { type: 'number' },
        error: { type: 'string' },
        message: { type: 'string' }
    }
};

const postObjectSchema = {
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
    },
    required: ['id', 'title', 'summary', 'content', 'isPublic', 'isDraft', 'createdAt', 'updatedAt',],
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

export const CreatePostSchema: FastifySchema = {
    summary: 'Tạo bài viết mới',
    tags: ['Posts'],
    body: {
        type: 'object',
        required: ['title', 'content', 'categoryId', 'isPublic'],
        properties: {
            title: { type: 'string' },
            summary: { type: 'string', nullable: true },
            content: { type: 'string' },
            categoryId: { type: 'number' },
            isPublic: { type: 'boolean', default: false },
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
