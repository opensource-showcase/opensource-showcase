/**
 * Interactive terminal UI for contribution curation
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { getFilterReasonText, getFilterStats } from '../filter/filter-prs.js';
import type { ContributionWithFilter, EnrichedContribution } from '../types/index.js';
import type { ContributedRepo } from '../github/fetch-repos.js';
import type { SaveContributionsResult } from '../repo/manage-repo.js';

const { Separator } = inquirer;
type Separator = InstanceType<typeof inquirer.Separator>;

interface ContributionChoice {
  name: string;
  value: string;
  checked: boolean;
  disabled?: boolean | string;
}

/**
 * Format a contribution for display in the checkbox list
 */
function formatContribution(contribution: ContributionWithFilter): string {
  const { repo, pr_title, repo_stars, language, filtered, filterReason, merged_at } = contribution;

  const stars = chalk.yellow(`⭐ ${repo_stars.toLocaleString()}`);
  const lang = language ? chalk.blue(`[${language}]`) : '';
  const date = chalk.gray(new Date(merged_at).toLocaleDateString());

  let title = `${chalk.bold(repo)} ${stars} ${lang}`;
  title += `\n   ${pr_title}`;
  title += `\n   ${date}`;

  if (filtered && filterReason) {
    const reason = chalk.red(`[Filtered: ${getFilterReasonText(filterReason)}]`);
    title += ` ${reason}`;
  }

  return title;
}

/**
 * Show filter statistics
 */
function showFilterStats(contributions: ContributionWithFilter[]): void {
  const stats = getFilterStats(contributions);

  logger.newline();
  logger.info(`Total PRs found: ${stats.total}`);
  logger.info(`Shown: ${stats.shown}`);

  if (stats.filtered > 0) {
    logger.warning(`Filtered: ${stats.filtered}`);
    logger.plain('');
    logger.plain(chalk.gray('  Filtered breakdown:'));

    Object.entries(stats.byReason).forEach(([reason, count]) => {
      logger.plain(chalk.gray(`    • ${getFilterReasonText(reason)}: ${count}`));
    });

    logger.newline();
    logger.info('Tip: Use --all flag to see filtered PRs, or toggle them in the list below');
  }

  logger.newline();
}

/**
 * Select repositories to include (Step 1: Repository selection)
 */
export async function selectRepositories(
  repos: ContributedRepo[],
  username: string
): Promise<string[]> {
  if (repos.length === 0) {
    logger.warning('No repositories found');
    return [];
  }

  logger.title('Select Projects to Include');
  logger.plain(
    chalk.gray("First, choose which projects to include. Then you'll select specific PRs.")
  );
  logger.newline();

  // Separate own repos from others
  const ownRepos = repos.filter((r) => r.owner.toLowerCase() === username.toLowerCase());
  const otherRepos = repos.filter((r) => r.owner.toLowerCase() !== username.toLowerCase());

  interface RepoChoice {
    name: string;
    value: string;
    checked: boolean;
  }

  // Create choices for other repos (auto-check if 100+ stars)
  const otherChoices: RepoChoice[] = otherRepos.map((repo) => {
    const stars = chalk.yellow(`⭐ ${repo.stars.toLocaleString()}`);
    const lang = repo.language ? chalk.blue(`[${repo.language}]`) : '';
    const prs = chalk.gray(`(~${repo.prCount} PRs)`);

    let name = `${chalk.bold(repo.fullName)} ${stars} ${lang} ${prs}`;
    if (repo.description) {
      name += `\n   ${chalk.gray(repo.description.substring(0, 80))}`;
    }

    return {
      name,
      value: repo.fullName,
      checked: repo.stars >= 100, // Auto-check repos with 100+ stars
    };
  });

  // Create choices for own repos (not auto-checked)
  const ownChoices: RepoChoice[] = ownRepos.map((repo) => {
    const stars = chalk.yellow(`⭐ ${repo.stars.toLocaleString()}`);
    const lang = repo.language ? chalk.blue(`[${repo.language}]`) : '';
    const prs = chalk.gray(`(~${repo.prCount} PRs)`);

    let name = `${chalk.bold(repo.fullName)} ${stars} ${lang} ${prs} ${chalk.red('[Your repo]')}`;
    if (repo.description) {
      name += `\n   ${chalk.gray(repo.description.substring(0, 80))}`;
    }

    return {
      name,
      value: repo.fullName,
      checked: false, // Never auto-check own repos
    };
  });

  // Combine with separator
  const allChoices: (RepoChoice | Separator)[] = [...otherChoices];

  if (ownChoices.length > 0) {
    allChoices.push(
      new Separator(chalk.gray('\n─── Your Repositories (usually not showcased) ───\n'))
    );
    allChoices.push(...ownChoices);
  }

  const answers = await inquirer.prompt<{ selected: string[] }>([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select projects:',
      choices: allChoices,
      pageSize: 15,
      loop: false,
    },
  ]);

  logger.newline();
  logger.success(`Selected ${answers.selected.length} projects`);
  logger.plain(chalk.gray(`  Now fetching PRs from these projects...`));
  logger.newline();

  return answers.selected;
}

/**
 * Interactive PR selection UI
 */
export async function selectContributions(
  contributions: ContributionWithFilter[],
  existingContributions: EnrichedContribution[] = []
): Promise<EnrichedContribution[]> {
  if (contributions.length === 0) {
    logger.warning('No contributions found to select');
    return [];
  }

  // Show statistics
  showFilterStats(contributions);

  // Create a map of existing PR URLs for pre-selection
  const existingUrls = new Set(existingContributions.map((c) => c.pr_url));

  // Separate filtered and unfiltered
  const unfiltered = contributions.filter((c) => !c.filtered);
  const filtered = contributions.filter((c) => c.filtered);

  // Create choices
  const unfilteredChoices: ContributionChoice[] = unfiltered.map((c) => ({
    name: formatContribution(c),
    value: c.pr_url,
    // Only auto-check if:
    // 1. Already in existing contributions OR
    // 2. High-value repo (1000+ stars)
    checked: existingUrls.has(c.pr_url) || c.repo_stars >= 1000,
  }));

  const filteredChoices: ContributionChoice[] = filtered.map((c) => ({
    name: formatContribution(c),
    value: c.pr_url,
    checked: existingUrls.has(c.pr_url),
  }));

  // Combine with separator
  const allChoices: (ContributionChoice | InstanceType<typeof Separator>)[] = [
    ...unfilteredChoices,
  ];

  if (filteredChoices.length > 0) {
    allChoices.push(new Separator(chalk.gray('\n─── Filtered PRs (toggle to include) ───\n')));
    allChoices.push(...filteredChoices);
  }

  logger.title('Select Contributions to Showcase');
  logger.plain(
    chalk.gray('Use ↑/↓ to navigate, Space to toggle, Enter to confirm, Ctrl+C to cancel')
  );
  logger.newline();

  // Show the selection UI
  const answers = await inquirer.prompt<{ selected: string[] }>([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select PRs to showcase:',
      choices: allChoices,
      pageSize: 15,
      loop: false,
    },
  ]);

  // Filter contributions to only selected ones
  const selectedUrls = new Set(answers.selected);
  const selected = contributions
    .filter((c) => selectedUrls.has(c.pr_url))
    .map((c) => {
      // Remove filter metadata
      const { filtered, filterReason, ...contribution } = c;
      return contribution;
    });

  logger.newline();
  logger.success(`Selected ${selected.length} contributions`);

  return selected;
}

/**
 * Confirm before saving
 */
export async function confirmSave(): Promise<boolean> {
  const { confirm } = await inquirer.prompt<{ confirm: boolean }>([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Save these contributions to your .opensource repository?',
      default: true,
    },
  ]);

  return confirm;
}

/**
 * Show final summary
 */
export function showSummary(
  username: string,
  contributionsCount: number,
  result: SaveContributionsResult
): void {
  logger.newline();
  logger.title('✨ Success!');
  logger.newline();
  logger.keyValue('Username', username);
  logger.keyValue('Contributions', contributionsCount.toString());
  logger.keyValue('Repository', result.repoUrl);
  logger.keyValue('GitHub Pages', result.pagesUrl);
  logger.newline();
  logger.info('Your contributions are now available at:');
  logger.plain(`  ${chalk.cyan(result.repoUrl)}`);
  logger.plain(`  ${chalk.cyan(result.pagesUrl)}`);
  if (result.customDomain) {
    logger.newline();
    logger.warning(`Custom domain detected: ${result.customDomain}`);
    logger.plain(
      chalk.gray(
        'GitHub Pages may redirect to that domain. Remove it in Settings → Pages if you want the github.io URL.'
      )
    );
  }
  if (!result.pagesEnabled) {
    logger.newline();
    logger.warning('GitHub Pages could not be enabled automatically.');
    logger.plain(
      chalk.gray(
        'Enable it manually from repository Settings → Pages → Deploy from a branch → main / root.'
      )
    );
  }
  logger.newline();
  logger.plain(chalk.gray('Next steps:'));
  logger.listItem('Share your GitHub Pages portfolio link');
  logger.listItem('Share your contributions on your resume/portfolio');
  logger.listItem('Run `opensource-showcase status` to view your contributions');
  logger.listItem('Run the tool again anytime to update');
  logger.newline();
}
