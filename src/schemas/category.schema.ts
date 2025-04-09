import { z } from 'zod';
import { FastifySchema } from 'fastify';

export const GetCategoryById = z.object({
    id: z.string().regex(/^\d+$/, 'ID phải là số'),
});

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
                        properties: {
                            id: { type: 'number' },
                            name: { type: 'string' },
                            description: { type: 'string' },
                            createdAt: { type: 'string', format: 'date-time' },
                            updatedAt: { type: 'string', format: 'date-time' },
                        },
                        required: ['id', 'name', 'description', 'createdAt', 'updatedAt'],
                    },
                },
            },
            required: ['data'],
        },
    }

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
                id: { type: 'number' },
                name: { type: 'string' },
                description: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
            },
        },
    },
};
