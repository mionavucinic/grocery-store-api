import express from 'express';
import { authRouter } from './routes/auth.routes';
import { errorHandler } from './middleware/error.middleware';
import { usersRouter } from './routes/users.routes';

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/users', usersRouter);

  app.use(errorHandler);
  return app;
}