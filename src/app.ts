import { swagger, prismaPlugin } from '@plugins/index';
import fastify from 'fastify';

const app = fastify({ logger: true });

swagger(app);
app.register(prismaPlugin);

app.get('/', async () => {
  return { message: 'Fastify Blog API is running' };
});

export default app;
