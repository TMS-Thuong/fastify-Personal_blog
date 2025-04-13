import { FastifyInstance } from 'fastify';

import { userMiddleware } from '@app/middleware/user.middleware';
import { uploadMediaSchema } from '@app/schemas/media.schema';

import MediaController from '../controllers/media.controller';

export default async function mediaRoutes(fastify: FastifyInstance) {
  fastify.post('/media/upload', {
    schema: uploadMediaSchema,
    attachValidation: true,
    preHandler: userMiddleware,
    // validatorCompiler: ({ schema, method, url, httpPart }) => {
    //   if (httpPart === 'body') {
    //     return () => true;
    //   }
    //   return fastify.validatorCompiler({ schema, method, url, httpPart });
    // },
    handler: MediaController.uploadMedia,
  });
}
