import { FastifyInstance } from 'fastify';
import MediaController  from '../controllers/media.controller';
import { userMiddleware } from '@app/middleware/user.middleware';
import { uploadMediaSchema } from '@app/schemas/media.schema';

export default async function mediaRoutes(fastify: FastifyInstance) {
    fastify.post('/media/upload', {
        schema: uploadMediaSchema,
        preHandler: userMiddleware,
        validatorCompiler: ({ schema, method, url, httpPart }) => {
            if (httpPart === 'body') {
                return () => true;
            }
            return fastify.validatorCompiler({ schema, method, url, httpPart });
        },
        handler: MediaController.uploadMedia,
    });
}