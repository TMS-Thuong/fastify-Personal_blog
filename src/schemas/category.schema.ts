import { z } from 'zod';
import { FastifySchema } from 'fastify';

export const GetCategoryById = z.object({
    id: z.string().regex(/^\d+$/, 'ID phải là số'),
});

export const CreateCategoryBody = z.object({
    name: z.string().min(1, 'Tên danh mục không được để trống'),
    description: z.string().optional(),
});

export type CreateCategoryInput = z.infer<typeof CreateCategoryBody>;

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
            properties: categoryresponse,
        },
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
            description: 'Tạo thành công',
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
};

