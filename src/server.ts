import app from './app';

const port = 3000;

const start = async () => {
  try {
    await app.ready();
    await app.listen({ port, host: '0.0.0.0' });

    console.log('Server running on http://localhost:' + port);
    console.log('Swagger Docs: http://localhost:' + port + '/api/docs');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
