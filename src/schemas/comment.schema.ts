import { FastifySchema } from 'fastify';
import { z } from 'zod';

const commentObjectSchema = {
    type: 'object',
    properties: {
        id: { type: 'number' },
        userId: { type: 'number' },
        postId: { type: 'number' },
        content: { type: 'string' },
        createdAt: { type: 'string', format: 'date-time' },
        updatedAt: { type: 'string', format: 'date-time' },
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
    content: z.string().min(1),
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
