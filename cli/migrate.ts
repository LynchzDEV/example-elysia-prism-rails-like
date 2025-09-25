#!/usr/bin/env bun

import { MigrateCommand } from '../src/cli/commands/migrate.command';

async function main() {
  const args = process.argv.slice(2);
  const migrateCommand = new MigrateCommand();

  try {
    await migrateCommand.execute(args);
  } catch (error) {
    process.exit(1);
  }
}

main();