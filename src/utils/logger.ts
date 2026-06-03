/**
 * Logging utilities with chalk for colored output
 */

import chalk from 'chalk';

export const logger = {
  info(message: string): void {
    console.log(chalk.blue('ℹ'), message);
  },

  success(message: string): void {
    console.log(chalk.green('✓'), message);
  },

  warning(message: string): void {
    console.log(chalk.yellow('⚠'), message);
  },

  error(message: string): void {
    console.log(chalk.red('✖'), message);
  },

  debug(message: string): void {
    if (process.env.DEBUG) {
      console.log(chalk.gray('→'), message);
    }
  },

  title(message: string): void {
    console.log();
    console.log(chalk.bold.cyan(message));
    console.log(chalk.cyan('─'.repeat(message.length)));
  },

  subtitle(message: string): void {
    console.log();
    console.log(chalk.bold(message));
  },

  plain(message: string): void {
    console.log(message);
  },

  newline(): void {
    console.log();
  },

  /**
   * Log a key-value pair
   */
  keyValue(key: string, value: string | number): void {
    console.log(chalk.gray(`${key}:`), chalk.white(value));
  },

  /**
   * Log a list item
   */
  listItem(message: string, prefix = '•'): void {
    console.log(chalk.gray(prefix), message);
  },
};
