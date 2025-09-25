import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { databaseConfig } from '../config/database';

declare global {
  var __prisma: PrismaClient | undefined;
}

class DatabaseManager {
  private static instance: DatabaseManager;
  private client: PrismaClient;
  private isConnected = false;

  private constructor() {
    this.client = globalThis.__prisma ?? new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'info', emit: 'event' },
        { level: 'warn', emit: 'event' },
        { level: 'error', emit: 'event' },
      ],
    });

    // Log database queries in development
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__prisma = this.client;

      this.client.$on('query', (e) => {
        logger.database.query(`${e.query} - ${e.duration}ms`);
      });

      this.client.$on('info', (e) => {
        logger.info(e.message, '📊');
      });

      this.client.$on('warn', (e) => {
        logger.warn(e.message, '⚠️');
      });

      this.client.$on('error', (e) => {
        logger.error(e.message, '💥');
      });
    }
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public get prisma(): PrismaClient {
    return this.client;
  }

  public async connect(): Promise<boolean> {
    try {
      logger.database.connecting(databaseConfig.DB_NAME);
      await this.client.$connect();
      this.isConnected = true;
      logger.database.connected(databaseConfig.DB_NAME);
      return true;
    } catch (error) {
      logger.error(`Failed to connect to database: ${error}`, '❌');
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.client.$disconnect();
      this.isConnected = false;
      logger.database.disconnected();
    } catch (error) {
      logger.error(`Error disconnecting from database: ${error}`, '❌');
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      await this.client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error(`Database health check failed: ${error}`, '💔');
      return false;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const db = DatabaseManager.getInstance();
export const prisma = db.prisma;