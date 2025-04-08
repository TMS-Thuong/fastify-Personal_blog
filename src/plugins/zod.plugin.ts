import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import fp from 'fastify-plugin';
import { ZodSchema, ZodError } from 'zod';

interface ZodValidationOptions {
    errorHandler?: (error: ZodError) => string;
}

const defaultErrorHandler = (error: ZodError): string => {
    return error.errors[0]?.message || 'Dữ liệu không hợp lệ';
};

const zodPlugin: FastifyPluginCallback<ZodValidationOptions> = (
    fastify: FastifyInstance,
    options: ZodValidationOptions,
    done
) => {
    const errorHandler = options.errorHandler || defaultErrorHandler;

    fastify.decorate('validateWithZod', function <T>(
        schema: ZodSchema<T>,
        data: unknown
    ): { success: boolean; data?: T; error?: ZodError; message?: string } {
        try {
            const result = schema.parse(data);
            return { success: true, data: result };
        } catch (error) {
            if (error instanceof ZodError) {
                return {
                    success: false,
                    error,
                    message: errorHandler(error)
                };
            }
            return {
                success: false,
                message: 'Lỗi xác thực không xác định'
            };
        }
    });

    done();
};

declare module 'fastify' {
    interface FastifyInstance {
        validateWithZod<T>(
            schema: ZodSchema<T>,
            data: unknown
        ): {
            success: boolean;
            data?: T;
            error?: ZodError;
            message?: string
        };
    }
}

export default fp(zodPlugin, {
    name: 'zod-validation',
    fastify: '>=4.0.0',
});