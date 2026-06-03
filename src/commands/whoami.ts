/**
 * Whoami command: show the currently authenticated GitHub user.
 */

import { getAuthenticatedClient, isAuthenticated } from '../auth/github-auth.js';
import { AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export async function whoamiCommand(): Promise<void> {
  if (!isAuthenticated()) {
    throw new AuthenticationError('Not authenticated. Run: opensource-showcase login');
  }

  const { username, user } = await getAuthenticatedClient();

  logger.title('GitHub Account');
  logger.newline();
  logger.keyValue('Username', username);
  if (user.name) {
    logger.keyValue('Name', user.name);
  }
  logger.keyValue('Profile', user.html_url);
  logger.newline();
}
