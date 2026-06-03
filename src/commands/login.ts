/**
 * Login command: authenticate with GitHub and save the token.
 */

import { authenticateWithGitHub } from '../auth/github-auth.js';
import { logger } from '../utils/logger.js';

export async function loginCommand(): Promise<void> {
  logger.title('GitHub Login');
  logger.newline();

  const { username } = await authenticateWithGitHub();

  logger.newline();
  logger.success(`Ready to curate contributions for @${username}`);
  logger.plain('Run: opensource-showcase');
  logger.newline();
}
