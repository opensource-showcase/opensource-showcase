/**
 * Manage the .opensource repository
 */

import type { Octokit } from '@octokit/rest';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { RepositoryError, ValidationError } from '../utils/errors.js';
import {
  OPENSOURCE_REPO_NAME,
  CONTRIBUTIONS_FILE,
  BACKUP_FILE,
  INDEX_FILE,
  README_FILE,
  SPEC_VERSION,
} from '../constants.js';
import type {
  ContributionsData,
  EnrichedContribution,
  Contributor,
  GitHubUser,
} from '../types/index.js';
import { generateReadme } from './generate-readme.js';
import { generateSite } from './generate-site.js';

export interface SaveContributionsResult {
  repoUrl: string;
  pagesUrl: string;
  pagesEnabled: boolean;
  customDomain?: string;
}

interface GitHubPagesResult {
  enabled: boolean;
  customDomain?: string;
}

async function getFileSha(
  octokit: Octokit,
  username: string,
  path: string
): Promise<string | undefined> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      path,
    });

    return 'sha' in data ? data.sha : undefined;
  } catch {
    return undefined;
  }
}

async function enableGitHubPages(
  octokit: Octokit,
  username: string
): Promise<GitHubPagesResult> {
  const source = {
    branch: 'main',
    path: '/',
  } as const;

  try {
    const { data: pages } = await octokit.request('GET /repos/{owner}/{repo}/pages', {
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
    });

    await octokit.request('PUT /repos/{owner}/{repo}/pages', {
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      source,
    });

    return {
      enabled: true,
      customDomain: pages.cname ?? undefined,
    };
  } catch (error) {
    const err = error as { status?: number };

    if (err.status !== 404) {
      logger.warning('Could not update GitHub Pages settings automatically');
      return { enabled: false };
    }
  }

  try {
    await octokit.request('POST /repos/{owner}/{repo}/pages', {
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      source,
    });

    return { enabled: true };
  } catch {
    logger.warning('Could not enable GitHub Pages automatically');
    return { enabled: false };
  }
}

/**
 * Check if .opensource repository exists
 */
export async function repositoryExists(
  octokit: Octokit,
  owner: string
): Promise<boolean> {
  try {
    await octokit.rest.repos.get({
      owner,
      repo: OPENSOURCE_REPO_NAME,
    });
    return true;
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Create .opensource repository
 */
export async function createRepository(
  octokit: Octokit,
  _username: string
): Promise<void> {
  const spinner = ora('Creating .opensource repository...').start();

  try {
    await octokit.rest.repos.createForAuthenticatedUser({
      name: OPENSOURCE_REPO_NAME,
      description: '📦 My curated open source contributions',
      auto_init: false,
      private: false,
    });

    spinner.succeed('Created .opensource repository');
  } catch (error) {
    spinner.fail('Failed to create repository');
    const err = error as { status?: number; message?: string };

    if (err.status === 422) {
      throw new RepositoryError('Repository already exists');
    }

    throw new RepositoryError(
      `Failed to create repository: ${err.message ?? 'Unknown error'}`
    );
  }
}

/**
 * Get existing contributions.json from repository
 */
export async function getExistingContributions(
  octokit: Octokit,
  username: string
): Promise<ContributionsData | null> {
  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      path: CONTRIBUTIONS_FILE,
    });

    if ('content' in data && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      const parsed = JSON.parse(content) as ContributionsData;

      // Validate schema version
      if (!parsed.version || parsed.version !== SPEC_VERSION) {
        logger.warning(
          `contributions.json has version ${parsed.version ?? 'unknown'}, expected ${SPEC_VERSION}`
        );
      }

      return parsed;
    }

    return null;
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 404) {
      return null; // File doesn't exist yet
    }
    throw error;
  }
}

/**
 * Create contributor object from GitHub user
 */
function createContributor(user: GitHubUser): Contributor {
  return {
    username: user.login,
    profile_url: user.html_url,
    name: user.name ?? undefined,
    email: user.email ?? undefined,
    bio: user.bio ?? undefined,
    location: user.location ?? undefined,
    website: user.blog ?? undefined,
    twitter: user.twitter_username ?? undefined,
  };
}

/**
 * Save contributions to repository
 */
export async function saveContributions(
  octokit: Octokit,
  username: string,
  user: GitHubUser,
  contributions: EnrichedContribution[]
): Promise<SaveContributionsResult> {
  const spinner = ora('Saving contributions...').start();

  try {
    // Check if repository exists
    const exists = await repositoryExists(octokit, username);

    if (!exists) {
      spinner.text = 'Creating .opensource repository...';
      await createRepository(octokit, username);
    }

    // Get existing contributions for backup
    const existing = await getExistingContributions(octokit, username);
    const contributionsFileSha = await getFileSha(octokit, username, CONTRIBUTIONS_FILE);
    const readmeFileSha = await getFileSha(octokit, username, README_FILE);
    const indexFileSha = await getFileSha(octokit, username, INDEX_FILE);

    // Create backup if existing data exists
    if (existing && contributionsFileSha) {
      spinner.text = 'Creating backup...';
      const backupContent = JSON.stringify(existing, null, 2);

      try {
        const { data: backupData } = await octokit.rest.repos.getContent({
          owner: username,
          repo: OPENSOURCE_REPO_NAME,
          path: BACKUP_FILE,
        });

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: username,
          repo: OPENSOURCE_REPO_NAME,
          path: BACKUP_FILE,
          message: `🔄 Backup contributions before update`,
          content: Buffer.from(backupContent).toString('base64'),
          sha: 'sha' in backupData ? backupData.sha : undefined,
        });
      } catch {
        // Backup file doesn't exist, create it
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: username,
          repo: OPENSOURCE_REPO_NAME,
          path: BACKUP_FILE,
          message: `🔄 Backup contributions before update`,
          content: Buffer.from(backupContent).toString('base64'),
        });
      }
    }

    // Prepare contributions data
    const contributionsData: ContributionsData = {
      version: SPEC_VERSION,
      updated_at: new Date().toISOString(),
      contributor: createContributor(user),
      contributions: contributions.map((c) => ({
        ...c,
        showcase: c.showcase ?? true,
      })),
    };

    const contributionsContent = JSON.stringify(contributionsData, null, 2);

    // Save contributions.json
    spinner.text = 'Saving contributions.json...';
    await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      path: CONTRIBUTIONS_FILE,
      message: `✨ Update OSS contributions via opensource-showcase CLI`,
      content: Buffer.from(contributionsContent).toString('base64'),
      sha: contributionsFileSha,
    });

    // Create/update README
    spinner.text = 'Generating README.md...';
    const readmeContent = generateReadme(contributionsData, {
      excludeOwnRepos: true,     // Filter out own repos for cleaner portfolio
      // No limit - show all projects
    });

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      path: README_FILE,
      message: readmeFileSha ? '📝 Update README' : '📝 Initialize README',
      content: Buffer.from(readmeContent).toString('base64'),
      sha: readmeFileSha,
    });

    // Create/update GitHub Pages site
    spinner.text = 'Generating index.html...';
    const siteContent = generateSite(contributionsData);

    await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      path: INDEX_FILE,
      message: indexFileSha ? '🌐 Update GitHub Pages site' : '🌐 Initialize GitHub Pages site',
      content: Buffer.from(siteContent).toString('base64'),
      sha: indexFileSha,
    });

    spinner.text = 'Enabling GitHub Pages...';
    const pages = await enableGitHubPages(octokit, username);

    const repoUrl = `https://github.com/${username}/${OPENSOURCE_REPO_NAME}`;
    const githubPagesUrl = `https://${username}.github.io/${OPENSOURCE_REPO_NAME}/`;
    const pagesUrl = pages.customDomain
      ? `https://${pages.customDomain}/${OPENSOURCE_REPO_NAME}/`
      : githubPagesUrl;
    spinner.succeed('Contributions saved successfully!');

    return {
      repoUrl,
      pagesUrl,
      pagesEnabled: pages.enabled,
      customDomain: pages.customDomain,
    };
  } catch (error) {
    spinner.fail('Failed to save contributions');
    throw new RepositoryError(
      `Failed to save contributions: ${(error as Error).message}`
    );
  }
}

/**
 * Validate contributions.json schema
 */
export function validateContributionsSchema(data: unknown): data is ContributionsData {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('Invalid contributions data: must be an object');
  }

  const obj = data as Record<string, unknown>;

  if (!obj.version || typeof obj.version !== 'string') {
    throw new ValidationError('Missing or invalid version field', 'version');
  }

  if (!obj.updated_at || typeof obj.updated_at !== 'string') {
    throw new ValidationError('Missing or invalid updated_at field', 'updated_at');
  }

  if (!obj.contributor || typeof obj.contributor !== 'object') {
    throw new ValidationError('Missing or invalid contributor field', 'contributor');
  }

  if (!Array.isArray(obj.contributions)) {
    throw new ValidationError(
      'Missing or invalid contributions field',
      'contributions'
    );
  }

  return true;
}
