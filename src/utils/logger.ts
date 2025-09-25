import { appConfig } from '../config/app';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
} as const;

const LOG_LEVEL_COLORS = {
  [LogLevel.DEBUG]: COLORS.cyan,
  [LogLevel.INFO]: COLORS.blue,
  [LogLevel.WARN]: COLORS.yellow,
  [LogLevel.ERROR]: COLORS.red,
} as const;

const LOG_LEVEL_NAMES = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
} as const;

class Logger {
  private currentLevel: LogLevel;

  constructor() {
    this.currentLevel = this.getLogLevelFromConfig();
  }

  private getLogLevelFromConfig(): LogLevel {
    switch (appConfig.LOG_LEVEL) {
      case 'debug': return LogLevel.DEBUG;
      case 'info': return LogLevel.INFO;
      case 'warn': return LogLevel.WARN;
      case 'error': return LogLevel.ERROR;
      default: return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private formatMessage(level: LogLevel, message: string, emoji?: string): string {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    const color = LOG_LEVEL_COLORS[level];
    const prefix = emoji ? `${emoji} ` : '';

    return `${COLORS.bright}[${timestamp}]${COLORS.reset} ${color}${levelName}${COLORS.reset} ${prefix}${message}`;
  }

  debug(message: string, emoji?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, emoji));
    }
  }

  info(message: string, emoji?: string): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(LogLevel.INFO, message, emoji));
    }
  }

  warn(message: string, emoji?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(LogLevel.WARN, message, emoji));
    }
  }

  error(message: string, emoji?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(LogLevel.ERROR, message, emoji));
    }
  }

  success(message: string, emoji: string = '✅'): void {
    console.log(`${COLORS.green}${emoji} ${message}${COLORS.reset}`);
  }

  // Database specific methods
  database = {
    connecting: (db: string) => this.info(`Connecting to database: ${db}`, '🔌'),
    connected: (db: string) => this.success(`Connected to database: ${db}`, '✅'),
    disconnected: () => this.info('Database disconnected', '📤'),
    query: (operation: string) => this.debug(`Database query: ${operation}`, '🔍'),
    migration: (name: string) => this.info(`Running migration: ${name}`, '🚀'),
    seed: (table: string, count: number) => this.info(`Seeded ${table}: ${count} records`, '🌱'),
  };

  // API specific methods
  api = {
    request: (method: string, path: string) => this.info(`${method} ${path}`, '📡'),
    response: (status: number, path: string) => {
      const emoji = status >= 400 ? '❌' : status >= 300 ? '↩️' : '✅';
      this.info(`${status} ${path}`, emoji);
    },
    error: (path: string, error: string) => this.error(`API Error on ${path}: ${error}`, '💥'),
  };
}

export const logger = new Logger();