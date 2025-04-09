import { z } from 'zod';
import { FastifySchema } from 'fastify';

export const GetPublicPostsQuery = z.object({
    search: z.string().optional(),
});

const PostSchema = z.object({
    id: z.number(),
    title: z.string(),
    summary: z.string().nullable(),
    content: z.string(),
    isPublic: z.boolean(),
    isDraft: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
})
export const GetPublicPostsSchema: FastifySchema = {
    querystring: {
        type: 'object',
        properties: {
            search: { type: 'string' },
        },
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: PostSchema
            },
        },
    },
};

export const GetMyPostsSchema: FastifySchema = {
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: PostSchema
            },
        },
    },
};
