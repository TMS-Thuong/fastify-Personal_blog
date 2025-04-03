import cors from '@fastify/cors';
import { swagger, prismaPlugin } from '@plugins/index';
import fastifyJwt from '@plugins/jwt';
import { authRoutes } from '@routes/index';
import { verifyEmailToken } from '@services/index';
import fastify from 'fastify';

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

app.register(fastifyJwt);

swagger(app).then(() => {
  app.log.info('Swagger loaded');
});

app.decorate('verifyEmailToken', verifyEmailToken);

app.register(authRoutes, { prefix: '/api' });

app.get('/', async () => {
  return { message: 'Fastify Blog API is running' };
});

export default app;
