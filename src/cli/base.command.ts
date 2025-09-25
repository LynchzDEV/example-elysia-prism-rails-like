import { logger } from '../utils/logger';

export abstract class BaseCommand {
  protected commandName: string;

  constructor(commandName: string) {
    this.commandName = commandName;
  }

  protected logStart(operation: string): void {
    logger.info(`Starting ${this.commandName}: ${operation}`, '🚀');
  }

  protected logSuccess(operation: string, details?: string): void {
    logger.success(`${this.commandName}: ${operation} completed${details ? ` - ${details}` : ''}`);
  }

  protected logError(operation: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`${this.commandName}: ${operation} failed - ${errorMessage}`, '💥');
  }

  protected logStep(step: string): void {
    logger.info(`  → ${step}`, '📝');
  }

  abstract execute(args?: string[]): Promise<void>;
}