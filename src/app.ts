import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';

import { swagger, prismaPlugin, errorHandler } from '@plugins/index';
import fastifyJwt from '@plugins/jwt';

import { authRoutes } from '@routes/auth.route';
import { userRoutes } from '@routes/user.route';

import AuthController from '@services/auth.service';
import { format as dateFnsFormat } from 'date-fns-tz';

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

app.addHook('onSend', (request, reply, payload, next) => {
  const vietnamTimeZone = 'Asia/Ho_Chi_Minh';
  const vietnamTime = dateFnsFormat(new Date(), 'EEE, dd MMM yyyy HH:mm:ss', { timeZone: vietnamTimeZone }) + ' GMT';

  reply.header('Date', vietnamTime);
  next();
});

app.register(cors, { origin: '*' });
app.register(multipart, { attachFieldsToBody: 'keyValues' });
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
