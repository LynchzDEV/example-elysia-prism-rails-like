import { app } from './app';
import { appConfig } from './config/app';
import { logger } from './utils/logger';

const server = app.listen(appConfig.PORT);

logger.info(`🦊 Elysia server running on port ${appConfig.PORT}`, '🌐');
logger.info(`📖 Environment: ${appConfig.NODE_ENV}`, '⚙️');
logger.info(`🔍 Log level: ${appConfig.LOG_LEVEL}`, '📊');
logger.info(`🌐 Health check: http://localhost:${appConfig.PORT}/health`, '🏥');

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down gracefully...', '🛑');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down gracefully...', '🛑');
  process.exit(0);
});

export { server };