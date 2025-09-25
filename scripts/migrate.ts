#!/usr/bin/env bun

import { execSync } from 'child_process';

const COLORS = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message: string, color?: keyof typeof COLORS) {
  const colorCode = color ? COLORS[color] : '';
  const resetCode = color ? COLORS.reset : '';
  console.log(`${colorCode}${message}${resetCode}`);
}

function runCommand(command: string, description: string) {
  try {
    log(`${COLORS.blue}► ${description}...${COLORS.reset}`);
    execSync(command, { stdio: 'inherit' });
    log(`${COLORS.green}✓ ${description} completed successfully${COLORS.reset}`);
    return true;
  } catch (error) {
    log(`${COLORS.red}✗ ${description} failed${COLORS.reset}`);
    console.error(error);
    return false;
  }
}

async function main() {
  log(`${COLORS.bold}${COLORS.blue}🚀 Rails-like Database Migration Tool${COLORS.reset}`);
  log('=====================================\n');

  const args = process.argv.slice(2);
  const command = args[0] || 'dev';

  switch (command) {
    case 'dev':
      log('Running development migration (creates and applies migration)...\n', 'yellow');

      if (!runCommand('bunx prisma migrate dev', 'Creating and applying migration')) {
        process.exit(1);
      }
      break;

    case 'deploy':
      log('Running production migration (applies pending migrations)...\n', 'yellow');

      if (!runCommand('bunx prisma migrate deploy', 'Applying pending migrations')) {
        process.exit(1);
      }
      break;

    case 'reset':
      log('Resetting database (WARNING: This will delete all data!)...\n', 'red');

      if (!runCommand('bunx prisma migrate reset --force', 'Resetting database')) {
        process.exit(1);
      }
      break;

    case 'status':
      log('Checking migration status...\n', 'yellow');

      runCommand('bunx prisma migrate status', 'Checking migration status');
      break;

    case 'generate':
      log('Generating Prisma client...\n', 'yellow');

      if (!runCommand('bunx prisma generate', 'Generating Prisma client')) {
        process.exit(1);
      }
      break;

    default:
      log('Usage:', 'bold');
      log('  bun run db:migrate [command]', 'blue');
      log('');
      log('Commands:', 'bold');
      log('  dev      Create and apply migration (default)', 'green');
      log('  deploy   Apply pending migrations', 'green');
      log('  reset    Reset database (deletes all data)', 'red');
      log('  status   Check migration status', 'yellow');
      log('  generate Generate Prisma client', 'blue');
      process.exit(1);
  }

  log(`\n${COLORS.green}${COLORS.bold}✅ Migration process completed!${COLORS.reset}`);
}

main().catch((error) => {
  log(`\n${COLORS.red}❌ Migration failed:${COLORS.reset}`);
  console.error(error);
  process.exit(1);
});