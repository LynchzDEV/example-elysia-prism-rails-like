import { execSync } from 'child_process';
import { BaseCommand } from '../base.command';

export class MigrateCommand extends BaseCommand {
  constructor() {
    super('Database Migration');
  }

  async execute(args: string[] = []): Promise<void> {
    const subCommand = args[0] || 'dev';

    this.logStart(`${subCommand} migration`);

    try {
      switch (subCommand) {
        case 'dev':
          await this.runDevMigration();
          break;
        case 'deploy':
          await this.runDeployMigration();
          break;
        case 'reset':
          await this.runResetMigration();
          break;
        case 'status':
          await this.checkMigrationStatus();
          break;
        case 'generate':
          await this.generateClient();
          break;
        default:
          this.showHelp();
          return;
      }

      this.logSuccess(`${subCommand} migration`);
    } catch (error) {
      this.logError(`${subCommand} migration`, error);
      process.exit(1);
    }
  }

  private async runDevMigration(): Promise<void> {
    this.logStep('Creating and applying migration for development');
    execSync('bunx prisma migrate dev', { stdio: 'inherit' });
  }

  private async runDeployMigration(): Promise<void> {
    this.logStep('Applying pending migrations for production');
    execSync('bunx prisma migrate deploy', { stdio: 'inherit' });
  }

  private async runResetMigration(): Promise<void> {
    this.logStep('Resetting database (WARNING: This will delete all data!)');
    execSync('bunx prisma migrate reset --force', { stdio: 'inherit' });
  }

  private async checkMigrationStatus(): Promise<void> {
    this.logStep('Checking migration status');
    execSync('bunx prisma migrate status', { stdio: 'inherit' });
  }

  private async generateClient(): Promise<void> {
    this.logStep('Generating Prisma client');
    execSync('bunx prisma generate', { stdio: 'inherit' });
  }

  private showHelp(): void {
    console.log(`
Usage: bun run db:migrate [command]

Commands:
  dev      Create and apply migration (default)
  deploy   Apply pending migrations
  reset    Reset database (deletes all data)
  status   Check migration status
  generate Generate Prisma client
`);
  }
}