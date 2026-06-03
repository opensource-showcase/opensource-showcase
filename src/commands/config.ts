/**
 * Config command: show/edit configuration
 */

import { homedir } from 'os';
import { join } from 'path';
import chalk from 'chalk';
import open from 'open';
import { logger } from '../utils/logger.js';
import { getUserConfig, configExists } from '../utils/config.js';
import { CONFIG_FILE_NAME } from '../constants.js';

interface ConfigOptions {
  edit?: boolean;
}

export async function configCommand(options: ConfigOptions): Promise<void> {
  const configPath = join(homedir(), CONFIG_FILE_NAME);

  logger.title('⚙️  Configuration');
  logger.newline();

  const exists = await configExists();

  if (!exists) {
    logger.warning(`No configuration file found at: ${configPath}`);
    logger.newline();
    logger.info('Using default configuration');
    logger.newline();
  } else {
    logger.info(`Configuration file: ${configPath}`);
    logger.newline();
  }

  if (options.edit) {
    logger.info('Opening configuration in default editor...');

    try {
      await open(configPath);
      logger.success('Configuration opened');
    } catch (error) {
      logger.error('Failed to open configuration file');
      logger.plain(`Please manually edit: ${configPath}`);
    }

    return;
  }

  // Show current config
  const config = await getUserConfig();

  logger.subtitle('Current Configuration');
  logger.newline();

  logger.keyValue('Min Stars', config.minStars.toString());
  logger.keyValue('Exclude Bot PRs', config.excludeBotPRs ? 'Yes' : 'No');
  logger.keyValue('Exclude Own Repos', config.excludeOwnRepos ? 'Yes' : 'No');

  logger.newline();
  logger.plain(chalk.bold('Exclude Title Patterns:'));
  config.excludeTitlePatterns.forEach((pattern) => {
    logger.listItem(pattern);
  });

  logger.newline();
  logger.plain(chalk.gray('To edit configuration:'));
  logger.plain(chalk.gray(`  opensource-showcase config --edit`));
  logger.plain(chalk.gray(`  Or manually edit: ${configPath}`));
  logger.newline();

  if (!exists) {
    logger.plain(chalk.gray('Example configuration:'));
    logger.newline();
    logger.plain(
      chalk.gray(
        JSON.stringify(
          {
            minStars: 10,
            excludeTitlePatterns: ['fix typo', 'chore:', 'update deps'],
            excludeBotPRs: true,
            excludeOwnRepos: true,
          },
          null,
          2
        )
      )
    );
    logger.newline();
  }
}
