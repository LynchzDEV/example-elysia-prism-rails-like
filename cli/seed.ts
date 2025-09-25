#!/usr/bin/env bun

import { SeedCommand } from '../src/cli/commands/seed.command';

async function main() {
  const seedCommand = new SeedCommand();

  try {
    await seedCommand.execute();
  } catch (error) {
    process.exit(1);
  }
}

main();