/**
 * Status command: show current contributions
 */

import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { getAuthenticatedClient, isAuthenticated } from '../auth/github-auth.js';
import { getExistingContributions } from '../repo/manage-repo.js';
import { AuthenticationError } from '../utils/errors.js';
import { OPENSOURCE_REPO_NAME } from '../constants.js';

export async function statusCommand(): Promise<void> {
  if (!isAuthenticated()) {
    throw new AuthenticationError('Not authenticated. Please run the main command first.');
  }

  const { octokit, username } = await getAuthenticatedClient();

  logger.title('📊 Current Contribution Status');
  logger.newline();

  const existing = await getExistingContributions(octokit, username);

  if (!existing) {
    logger.warning('No contributions found');
    logger.newline();
    logger.plain('Run the main command to curate your contributions:');
    logger.plain(chalk.cyan('  npx opensource-showcase'));
    logger.newline();
    return;
  }

  logger.success(`Found ${existing.contributions.length} showcased contributions`);
  logger.newline();

  // Show contributor info
  logger.subtitle('Contributor');
  logger.keyValue('Username', existing.contributor.username);
  if (existing.contributor.name) {
    logger.keyValue('Name', existing.contributor.name);
  }
  if (existing.contributor.website) {
    logger.keyValue('Website', existing.contributor.website);
  }
  logger.keyValue('Profile', existing.contributor.profile_url);

  // Show stats
  logger.newline();
  logger.subtitle('Statistics');

  const languages = new Map<string, number>();
  const repos = new Map<string, number>();

  existing.contributions.forEach((c) => {
    if (c.language) {
      languages.set(c.language, (languages.get(c.language) ?? 0) + 1);
    }
    repos.set(c.repo, (repos.get(c.repo) ?? 0) + 1);
  });

  logger.keyValue('Total contributions', existing.contributions.length.toString());
  logger.keyValue('Unique repositories', repos.size.toString());
  logger.keyValue('Languages', languages.size.toString());
  logger.keyValue('Last updated', new Date(existing.updated_at).toLocaleString());

  // Show top languages
  if (languages.size > 0) {
    logger.newline();
    logger.subtitle('Top Languages');

    const sortedLangs = [...languages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    sortedLangs.forEach(([lang, count]) => {
      logger.listItem(`${lang}: ${count} contributions`);
    });
  }

  // Show top repos
  if (repos.size > 0) {
    logger.newline();
    logger.subtitle('Top Repositories');

    const sortedRepos = [...repos.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

    sortedRepos.forEach(([repo, count]) => {
      const contribution = existing.contributions.find((c) => c.repo === repo);
      const stars = contribution ? `⭐ ${contribution.repo_stars.toLocaleString()}` : '';
      logger.listItem(`${repo} ${chalk.yellow(stars)} (${count} PRs)`);
    });
  }

  // Show recent contributions
  logger.newline();
  logger.subtitle('Recent Contributions');

  const recent = existing.contributions
    .sort((a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime())
    .slice(0, 5);

  recent.forEach((c) => {
    const date = new Date(c.merged_at).toLocaleDateString();
    logger.plain(`  ${chalk.gray(date)} ${chalk.bold(c.repo)}`);
    logger.plain(`    ${c.pr_title}`);
    logger.plain(`    ${chalk.blue(c.pr_url)}`);
    logger.newline();
  });

  // Show repository link
  logger.subtitle('Repository');
  const repoUrl = `https://github.com/${username}/${OPENSOURCE_REPO_NAME}`;
  logger.plain(chalk.cyan(repoUrl));
  logger.newline();
}
