import cors from '@fastify/cors';
import { swagger, prismaPlugin, errorHandler } from '@plugins/index';
import fastifyJwt from '@plugins/jwt';
import { authRoutes } from '@routes/auth.route';
import AuthController from '@services/auth.service';
import fastify from 'fastify';

import { userRoutes } from './routes/user.route';

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

app.register(cors, {
  origin: '*',
});

app.register(prismaPlugin);
app.register(errorHandler);
app.register(fastifyJwt);

swagger(app).then(() => {
  app.log.info('Swagger loaded');
});

app.decorate('verifyEmailToken', AuthController.verifyEmailToken);

app.register(authRoutes, { prefix: '/api' });
app.register(userRoutes, { prefix: '/api' });

app.get('/', async () => {
  return { message: 'Fastify Blog API is running' };
});

export default app;
