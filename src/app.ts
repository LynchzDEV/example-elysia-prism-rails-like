import { Elysia } from 'elysia';
import { db } from './lib/database';
import { logger } from './utils/logger';
import { appConfig } from './config/app';
import { userController } from './controllers/user.controller';
import { postController } from './controllers/post.controller';

export const app = new Elysia()
  .onStart(async () => {
    logger.info('🚀 Starting Elysia application...', '🚀');

    const connected = await db.connect();
    if (!connected) {
      logger.error('❌ Failed to connect to database. Exiting...', '💥');
      process.exit(1);
    }
  })

  .onStop(async () => {
    logger.info('⏹️ Stopping Elysia application...', '⏹️');
    await db.disconnect();
  })

  .get('/', () => {
    logger.api.request('GET', '/');

    return {
      message: 'Welcome to Elysia + Prisma Blog API',
      version: '2.0.0',
      architecture: 'Clean Architecture with Service Layer',
      endpoints: {
        users: '/users',
        posts: '/posts',
        health: '/health'
      },
      rails_like_commands: {
        migrate: 'bun run db:migrate',
        seed: 'bun run db:seed',
        reset: 'bun run db:migrate reset'
      }
    };
  })

  .get('/health', async () => {
    logger.api.request('GET', '/health');

    try {
      const isHealthy = await db.healthCheck();

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        database: isHealthy ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: appConfig.NODE_ENV
      };
    } catch (error) {
      logger.api.error('/health', error instanceof Error ? error.message : 'Unknown error');
      return {
        status: 'unhealthy',
        database: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      };
    }
  })

  .use(userController)
  .use(postController)

  .onError(({ code, error, set }) => {
    logger.error(`Application error: ${code} - ${error.message}`, '💥');

    switch (code) {
      case 'VALIDATION':
        set.status = 400;
        return { success: false, error: 'Validation error', details: error.message };
      case 'NOT_FOUND':
        set.status = 404;
        return { success: false, error: 'Resource not found' };
      default:
        set.status = 500;
        return { success: false, error: 'Internal server error' };
    }
  });