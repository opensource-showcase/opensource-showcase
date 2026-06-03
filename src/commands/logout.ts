/**
 * Logout command: clear stored authentication
 */

import inquirer from 'inquirer';
import { logger } from '../utils/logger.js';
import { clearAllData, getStoredUsername } from '../utils/config.js';

export async function logoutCommand(): Promise<void> {
  const username = getStoredUsername();

  if (!username) {
    logger.info('Not currently logged in');
    return;
  }

  logger.title('👋 Logout');
  logger.newline();
  logger.info(`Currently logged in as: ${username}`);
  logger.newline();

  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to logout? This will clear all stored data.',
      default: false,
    },
  ]);

  if (!confirm) {
    logger.info('Logout cancelled');
    return;
  }

  clearAllData();

  logger.newline();
  logger.success('Successfully logged out');
  logger.info('Run the tool again to login with a different account');
  logger.newline();
}
