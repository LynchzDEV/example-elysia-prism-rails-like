import { logger } from '../utils/logger';

export abstract class BaseService {
  protected serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected logOperation(operation: string, details?: any): void {
    logger.info(`${this.serviceName}: ${operation}`, '🔧');
    if (details && process.env.NODE_ENV === 'development') {
      logger.debug(`Details: ${JSON.stringify(details)}`, '📝');
    }
  }

  protected logSuccess(operation: string, result?: any): void {
    logger.success(`${this.serviceName}: ${operation} completed`);
    if (result && process.env.NODE_ENV === 'development') {
      logger.debug(`Result: ${JSON.stringify(result)}`, '✨');
    }
  }

  protected logError(operation: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`${this.serviceName}: ${operation} failed - ${errorMessage}`, '💥');
  }
}