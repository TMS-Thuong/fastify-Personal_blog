import { FastifyInstance } from 'fastify';
import { Client } from 'pg';

export default async function dbConnector(fastify: FastifyInstance) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();
  fastify.decorate('db', client);

  fastify.addHook('onClose', async () => {
    await client.end();
  });

  console.log('Database connected!');
}
