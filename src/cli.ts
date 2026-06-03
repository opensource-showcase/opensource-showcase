#!/usr/bin/env node

/**
 * CLI entry point for opensource-showcase
 */

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import { logger } from './utils/logger.js';
import {
  getErrorMessage,
  isCustomError,
  RateLimitError,
  ValidationError,
} from './utils/errors.js';
import { mainFlow } from './commands/main.js';
import { loginCommand } from './commands/login.js';
import { statusCommand } from './commands/status.js';
import { logoutCommand } from './commands/logout.js';
import { configCommand } from './commands/config.js';
import { validateCommand } from './commands/validate.js';
import { whoamiCommand } from './commands/whoami.js';

const program = new Command();

program
  .name('opensource-showcase')
  .description('📦 CLI tool to curate and showcase your open source contributions')
  .version('0.1.0');

// Main command
program
  .command('curate', { isDefault: true })
  .description('Curate your open source contributions (default)')
  .option('--all', 'Show all PRs without filtering')
  .option('--min-stars <number>', 'Minimum repository stars', parseInt)
  .option('--since <date>', 'Only fetch PRs merged after this date (YYYY-MM-DD)')
  .option('--fresh', 'Start fresh, ignore existing contributions')
  .option('--debug', 'Enable debug logging')
  .action(async (options) => {
    try {
      if (options.debug) {
        process.env.DEBUG = 'true';
      }
      await mainFlow(options);
    } catch (error) {
      handleError(error);
    }
  });

// Login command
program
  .command('login')
  .description('Login to GitHub in your browser')
  .action(async () => {
    try {
      await loginCommand();
    } catch (error) {
      handleError(error);
    }
  });

// Whoami command
program
  .command('whoami')
  .description('Show the currently authenticated GitHub account')
  .action(async () => {
    try {
      await whoamiCommand();
    } catch (error) {
      handleError(error);
    }
  });

// Status command
program
  .command('status')
  .description('View your current showcased contributions')
  .action(async () => {
    try {
      await statusCommand();
    } catch (error) {
      handleError(error);
    }
  });

// Logout command
program
  .command('logout')
  .description('Clear saved GitHub login')
  .action(async () => {
    try {
      await logoutCommand();
    } catch (error) {
      handleError(error);
    }
  });

// Config command
program
  .command('config')
  .description('Show current configuration')
  .option('--edit', 'Open configuration file in editor')
  .action(async (options) => {
    try {
      await configCommand(options);
    } catch (error) {
      handleError(error);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate contributions.json schema')
  .argument('[file]', 'Path to contributions.json file', 'contributions.json')
  .action(async (file) => {
    try {
      await validateCommand(file);
    } catch (error) {
      handleError(error);
    }
  });

/**
 * Handle errors with proper formatting
 */
function handleError(error: unknown): void {
  logger.newline();

  if (isCustomError(error)) {
    logger.error(error.message);

    if (error.name === 'RateLimitError') {
      const rateLimitError = error as RateLimitError;
      const resetDate = new Date(rateLimitError.resetAt);
      logger.info(`Rate limit resets at: ${resetDate.toLocaleTimeString()}`);
    }

    if (error.name === 'ValidationError') {
      const validationError = error as ValidationError;
      if (validationError.field) {
        logger.info(`Field: ${validationError.field}`);
      }
    }
  } else {
    logger.error(`Unexpected error: ${getErrorMessage(error)}`);

    if (process.env.DEBUG) {
      console.error(error);
    }
  }

  logger.newline();
  logger.plain(chalk.gray('Need help? Run with --debug flag for more information'));
  logger.plain(
    chalk.gray('Report issues: https://github.com/opensource-showcase/cli/issues')
  );
  logger.newline();

  process.exit(1);
}

/**
 * Show banner
 */
function showBanner(): void {
  console.log(
    chalk.cyan.bold(`
  ╔═══════════════════════════════════════╗
  ║                                       ║
  ║   📦  opensource-showcase             ║
  ║                                       ║
  ║   Curate your OSS contributions       ║
  ║                                       ║
  ╚═══════════════════════════════════════╝
  `)
  );
}

// Parse arguments
if (process.argv.length === 2) {
  // No arguments provided, show banner and run default command
  showBanner();
}

program.parse();
