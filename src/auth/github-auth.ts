/**
 * GitHub OAuth authentication using Device Flow
 */

import { createOAuthDeviceAuth } from '@octokit/auth-oauth-device';
import { Octokit } from '@octokit/rest';
import open from 'open';
import ora from 'ora';
import { GITHUB_SCOPES } from '../constants.js';
import { logger } from '../utils/logger.js';
import { AuthenticationError } from '../utils/errors.js';
import {
  storeToken,
  storeUsername,
  storeUser,
  getStoredToken,
} from '../utils/config.js';
import type { AuthContext } from '../types/index.js';

const PLACEHOLDER_CLIENT_ID: string = 'YOUR_PUBLIC_CLIENT_ID_HERE';
const CLIENT_ID: string = 'Ov23li4P4stPDon9vAt1';
const CLIENT_TYPE = 'oauth-app';

interface OAuthTokenResponse {
  token: string;
}

/**
 * Authenticate with GitHub using Device Flow
 */
export async function authenticateWithGitHub(): Promise<AuthContext> {
  if (!isOAuthConfigured()) {
    throw new AuthenticationError(
      'GitHub OAuth is not configured. Replace YOUR_PUBLIC_CLIENT_ID_HERE in src/auth/github-auth.ts before publishing.'
    );
  }

  const spinner = ora('Authenticating with GitHub...').start();

  try {
    const auth = createOAuthDeviceAuth({
      clientType: CLIENT_TYPE,
      clientId: CLIENT_ID,
      scopes: [...GITHUB_SCOPES],
      onVerification: (verification) => {
        spinner.stop();
        logger.newline();
        logger.info('Please authorize this application:');
        logger.plain(`  1. Visit: ${verification.verification_uri}`);
        logger.plain(`  2. Enter code: ${verification.user_code}`);
        logger.newline();
        logger.info('Opening browser...');

        // Open browser automatically
        open(verification.verification_uri).catch(() => {
          logger.warning('Could not open browser automatically');
        });

        spinner.start('Waiting for authorization...');
      },
    });

    // This will wait for the user to authorize
    const { token } = (await auth({ type: 'oauth' })) as OAuthTokenResponse;

    spinner.text = 'Verifying authentication...';

    // Create Octokit instance with the token
    const octokit = new Octokit({ auth: token });

    // Get user information
    const { data: user } = await octokit.rest.users.getAuthenticated();

    // Store token and username
    storeToken(token);
    storeUsername(user.login);
    storeUser(user);

    spinner.succeed(`Authenticated as ${user.login}`);

    return { octokit, username: user.login, user };
  } catch (error) {
    spinner.fail('Authentication failed');
    throw new AuthenticationError(
      `Failed to authenticate: ${(error as Error).message}`
    );
  }
}

/**
 * Check whether the packaged CLI has a usable GitHub OAuth client ID.
 */
export function isOAuthConfigured(): boolean {
  return CLIENT_ID.trim().length > 0 && CLIENT_ID !== PLACEHOLDER_CLIENT_ID;
}

/**
 * Create Octokit instance from the saved GitHub login
 */
export async function getAuthenticatedClient(): Promise<AuthContext> {
  const authToken = getStoredToken();

  if (!authToken) {
    throw new AuthenticationError('No saved GitHub login found. Please login first.');
  }

  const octokit = new Octokit({ auth: authToken });

  try {
    const { data: user } = await octokit.rest.users.getAuthenticated();
    return { octokit, username: user.login, user };
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 401) {
      throw new AuthenticationError('Saved GitHub login expired or invalid. Please login again.');
    }
    throw new AuthenticationError(
      `Authentication verification failed: ${err.message ?? 'Unknown error'}`
    );
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getStoredToken();
}

/**
 * Check rate limit status
 */
export async function checkRateLimit(octokit: Octokit): Promise<{
  limit: number;
  remaining: number;
  reset: Date;
}> {
  const { data } = await octokit.rest.rateLimit.get();
  const core = data.resources.core;

  return {
    limit: core.limit,
    remaining: core.remaining,
    reset: new Date(core.reset * 1000),
  };
}

/**
 * Wait for rate limit reset if needed
 */
export async function waitForRateLimit(
  octokit: Octokit,
  minRemaining = 10
): Promise<void> {
  const rateLimit = await checkRateLimit(octokit);

  if (rateLimit.remaining < minRemaining) {
    const waitMs = rateLimit.reset.getTime() - Date.now();
    const waitMinutes = Math.ceil(waitMs / 1000 / 60);

    logger.warning(
      `Rate limit low (${rateLimit.remaining} remaining). Waiting ${waitMinutes} minutes...`
    );

    const spinner = ora('Waiting for rate limit reset...').start();

    await new Promise((resolve) => setTimeout(resolve, waitMs));

    spinner.succeed('Rate limit reset. Continuing...');
  }
}
