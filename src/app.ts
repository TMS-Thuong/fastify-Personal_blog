import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';

import path from 'path';
import { swagger, prismaPlugin, errorHandler } from '@plugins/index';
import fastifyJwt from '@plugins/jwt';

import { authRoutes } from '@routes/auth.routes';
import { userRoutes } from '@routes/user.routes';
import { categoryRoutes } from '@routes/category.routes';

import AuthController from '@services/auth.service';
import { postRoutes } from './routes/post.routes';
import zodPlugin from '@plugins/zod.plugin';
import mediaRoutes from './routes/media.routes';
import { commentRoutes } from './routes/comment.routes';


declare module 'fastify' {
  interface FastifyInstance {
    verifyEmailToken: (token: string) => Promise<{ success: boolean; message: string }>;
  }
}

const app = fastify({
  logger: true,
  ajv: {
    customOptions: {
      strict: false,
    },
  },
});

app.register(cors, { origin: '*' });
app.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

app.register(fastifyStatic, {
  root: path.join(__dirname, '..'),
  prefix: '/images',
})
app.register(prismaPlugin);
app.register(errorHandler);
app.register(fastifyJwt);
app.register(zodPlugin);

swagger(app).then(() => {
  app.log.info('Swagger loaded');
});

app.decorate('verifyEmailToken', AuthController.verifyEmailToken);

app.register(authRoutes, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api' });
app.register(categoryRoutes, { prefix: '/api' });
app.register(postRoutes, { prefix: '/api' });
app.register(mediaRoutes, { prefix: '/api' });
app.register(commentRoutes, { prefix: '/api' });
app.get('/', async () => {
  return { message: 'Fastify Blog API is running' };
});

export default app;
