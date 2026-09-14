import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { env, isProduction } from './config/env.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', 1);
  app.disable('x-powered-by');

  app.use(helmet());

  // The SPA is served from a different origin during development.
  const allowedOrigins = new Set(
    [env.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'].filter(Boolean),
  );
  app.use(
    cors({
      origin(origin, callback) {
        // Same-origin / curl / server-to-server requests have no Origin header.
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(new Error(`Origin not allowed by CORS: ${origin}`));
      },
      credentials: true,
    }),
  );

  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  if (!isProduction()) app.use(morgan('dev'));

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
