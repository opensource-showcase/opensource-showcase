/**
 * Main command flow: authenticate → fetch → filter → curate → save
 */

import { logger } from '../utils/logger.js';
import { getUserConfig } from '../utils/config.js';
import {
  authenticateWithGitHub,
  getAuthenticatedClient,
  isAuthenticated,
  waitForRateLimit,
} from '../auth/github-auth.js';
import { fetchPRDetails } from '../github/fetch-prs.js';
import { selectContributions, confirmSave, showSummary } from '../ui/interactive.js';
import { getExistingContributions, saveContributions } from '../repo/manage-repo.js';
import type { CLIOptions, EnrichedContribution } from '../types/index.js';

export async function mainFlow(options: CLIOptions): Promise<void> {
  logger.title('🚀 Starting Contribution Curation');
  logger.newline();

  // Step 1: Authentication
  logger.subtitle('Step 1: Authentication');

  let authContext;

  if (isAuthenticated()) {
    // Use stored credentials
    logger.info('Using stored credentials...');
    try {
      authContext = await getAuthenticatedClient();
    } catch {
      logger.warning('Saved GitHub login expired or invalid.');
      logger.info('Starting browser login again...');
      authContext = await authenticateWithGitHub();
    }
  } else {
    // First time - use GitHub Device Flow so users do not have to configure credentials.
    logger.info('First time setup. Starting GitHub browser login...');
    authContext = await authenticateWithGitHub();
  }

  const { octokit, username, user } = authContext;

  // Step 2: Load configuration
  logger.newline();
  logger.subtitle('Step 2: Loading Configuration');

  const config = await getUserConfig();

  // Override min stars if provided
  if (options.minStars !== undefined) {
    config.minStars = options.minStars;
    logger.info(`Overriding min stars filter: ${options.minStars}`);
  }

  logger.info(`Config loaded (min stars: ${config.minStars})`);

  // Step 3: Fetch list of contributed repositories (fast!)
  logger.newline();
  logger.subtitle('Step 3: Finding Your Contributed Projects');

  const { fetchContributedRepositories } = await import('../github/fetch-repos.js');
  const repos = await fetchContributedRepositories(octokit, username);

  if (repos.length === 0) {
    logger.warning('No contributed repositories found');
    return;
  }

  // Step 4: User selects repositories
  logger.newline();
  logger.subtitle('Step 4: Select Projects to Include');

  const { selectRepositories } = await import('../ui/interactive.js');
  const selectedRepos = await selectRepositories(repos, username);

  if (selectedRepos.length === 0) {
    logger.warning('No repositories selected');
    return;
  }

  // Step 5: Fetch PRs only from selected repos
  logger.newline();
  logger.subtitle('Step 5: Fetching Pull Requests from Selected Projects');

  const allPRs: EnrichedContribution[] = [];

  for (const repoFullName of selectedRepos) {
    const [owner, repoName] = repoFullName.split('/');
    if (!owner || !repoName) continue;

    logger.info(`Fetching PRs from ${repoFullName}...`);

    try {
      // Use Search API to find PRs in this specific repo (much faster!)
      const query = `is:pr is:merged author:${username} repo:${repoFullName}`;

      await waitForRateLimit(octokit, 10);

      const { data } = await octokit.rest.search.issuesAndPullRequests({
        q: query,
        per_page: 100,
        sort: 'updated',
        order: 'desc',
      });

      const userPRs = data.items.filter((item) => 'pull_request' in item);

      if (userPRs.length === 0) {
        logger.plain(`  No merged PRs found in ${repoFullName}`);
        continue;
      }

      // Get repo details
      const { data: repoData } = await octokit.rest.repos.get({
        owner,
        repo: repoName,
      });

      // Enrich each PR
      for (let i = 0; i < userPRs.length; i++) {
        const pr = userPRs[i];
        if (!pr) continue;

        await waitForRateLimit(octokit, 5);

        // Extract PR number from URL
        const prMatch = pr.html_url.match(/\/pull\/(\d+)$/);
        const prNumber = prMatch ? parseInt(prMatch[1] || '0', 10) : 0;

        if (!prNumber) continue;

        const prDetails = await fetchPRDetails(octokit, owner, repoName, prNumber);

        allPRs.push({
          repo: repoFullName,
          pr_number: prNumber,
          pr_title: pr.title,
          pr_url: pr.html_url,
          pr_body: prDetails.body ?? undefined,
          merged_at: pr.closed_at ?? new Date().toISOString(),
          language: repoData.language,
          repo_stars: repoData.stargazers_count,
          repo_description: repoData.description,
          labels: (prDetails.labels ?? []).map((l) => l.name),
          additions: prDetails.additions ?? 0,
          deletions: prDetails.deletions ?? 0,
          files_changed: prDetails.changed_files ?? 0,
          reviewers: prDetails.reviewers,
          merged_by: prDetails.merged_by ?? undefined,
          showcase: true,
        });
      }

      logger.success(`  Found ${userPRs.length} PRs in ${repoFullName}`);
    } catch (error) {
      logger.warning(`  Failed to fetch PRs from ${repoFullName}: ${(error as Error).message}`);
    }
  }

  if (allPRs.length === 0) {
    logger.warning('No PRs found in selected repositories');
    return;
  }

  logger.newline();
  logger.success(`Total: ${allPRs.length} PRs from ${selectedRepos.length} projects`);

  // Step 6: Check existing contributions
  logger.newline();
  logger.subtitle('Step 6: Checking Existing Contributions');

  let existing = null;
  if (!options.fresh) {
    existing = await getExistingContributions(octokit, username);
  }

  if (existing && !options.fresh) {
    logger.success(`Found ${existing.contributions.length} existing contributions`);
  } else if (options.fresh) {
    logger.info('Starting fresh (ignoring existing contributions)');
  } else {
    logger.info('No existing contributions found');
  }

  // Step 7: Interactive selection
  logger.newline();
  logger.subtitle('Step 7: Select Specific PRs to Showcase');

  const selected = await selectContributions(
    allPRs.map((c) => ({ ...c, filtered: false })),
    existing?.contributions ?? []
  );

  if (selected.length === 0) {
    logger.warning('No contributions selected');
    return;
  }

  // Step 8: Confirm save
  logger.newline();
  const confirmed = await confirmSave();

  if (!confirmed) {
    logger.info('Cancelled. No changes made.');
    return;
  }

  // Step 9: Save to repository
  logger.newline();
  logger.subtitle('Step 8: Saving Contributions');

  const result = await saveContributions(octokit, username, user, selected);

  // Show summary
  showSummary(username, selected.length, result);
}
