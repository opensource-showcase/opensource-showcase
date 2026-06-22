/**
 * Fetch merged Pull Requests from GitHub
 */

import type { Octokit } from '@octokit/rest';
import ora from 'ora';
import { NetworkError, RateLimitError } from '../utils/errors.js';
import { waitForRateLimit } from '../auth/github-auth.js';
import type {
  PullRequest,
  Repository,
  EnrichedContribution,
  ProgressCallback,
} from '../types/index.js';

interface SearchPRsOptions {
  username: string;
  since?: string;
  onProgress?: ProgressCallback;
}

/**
 * Fetch all merged PRs for a user using GitHub Search API
 * Note: GitHub Search API has a hard limit of 1000 results
 */
export async function fetchMergedPRs(
  octokit: Octokit,
  options: SearchPRsOptions
): Promise<PullRequest[]> {
  const { username, since, onProgress } = options;
  const spinner = ora('Fetching your merged Pull Requests...').start();

  try {
    // Build search query
    let query = `is:pr is:merged author:${username}`;
    if (since) {
      query += ` merged:>=${since}`;
    }

    // Search for PRs (GitHub Search API returns max 1000 results)
    const allPRs: PullRequest[] = [];
    let page = 1;
    const perPage = 100;
    const MAX_RESULTS = 1000; // GitHub Search API hard limit

    /* eslint-disable-next-line prefer-const */
    let hasMore = true;
    while (hasMore) {
      // Check rate limit before each request
      await waitForRateLimit(octokit, 10);

      spinner.text = `Fetching PRs (page ${page})...`;

      const { data } = await octokit.rest.search.issuesAndPullRequests({
        q: query,
        sort: 'updated',
        order: 'desc',
        per_page: perPage,
        page,
      });

      if (data.items.length === 0) {
        break;
      }

      // Filter for actual PRs (search can return issues too)
      const prs = data.items.filter((item) => 'pull_request' in item) as unknown as PullRequest[];

      allPRs.push(...prs);

      onProgress?.(
        allPRs.length,
        Math.min(data.total_count, MAX_RESULTS),
        `Fetched ${allPRs.length} PRs`
      );

      // Check if we've fetched all results or hit the limit
      if (
        allPRs.length >= MAX_RESULTS ||
        allPRs.length >= data.total_count ||
        data.items.length < perPage
      ) {
        if (data.total_count > MAX_RESULTS) {
          spinner.warn(
            `Note: GitHub Search API limits results to 1000. You have ${data.total_count} total PRs.`
          );
          spinner.info('Tip: Use --since=YYYY-MM-DD to fetch more recent PRs');
        }
        break;
      }

      page++;
    }

    spinner.succeed(`Fetched ${allPRs.length} merged Pull Requests`);
    return allPRs;
  } catch (error) {
    spinner.fail('Failed to fetch Pull Requests');

    const err = error as { status?: number; message?: string };

    if (err.status === 403) {
      throw new RateLimitError('GitHub API rate limit exceeded', Date.now() + 3600000);
    }

    throw new NetworkError(
      `Failed to fetch PRs: ${err.message ?? 'Unknown error'}`,
      error as Error
    );
  }
}

/**
 * Fetch repository details for a given repo
 */
export async function fetchRepository(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Repository> {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });
    return data;
  } catch (error) {
    const err = error as { status?: number; message?: string };

    if (err.status === 404) {
      // Repository might be deleted or private
      return {
        name: repo,
        full_name: `${owner}/${repo}`,
        description: null,
        language: null,
        stargazers_count: 0,
        owner: { login: owner },
      };
    }

    throw new NetworkError(
      `Failed to fetch repository ${owner}/${repo}: ${err.message ?? 'Unknown error'}`,
      error as Error
    );
  }
}

/**
 * Fetch PR details including additions, deletions, files changed, body, and reviewers
 */
export async function fetchPRDetails(
  octokit: Octokit,
  owner: string,
  repo: string,
  prNumber: number
): Promise<
  Pick<PullRequest, 'additions' | 'deletions' | 'changed_files' | 'labels'> & {
    body: string | null;
    reviewers: Array<{ login: string; avatar_url: string }>;
    merged_by: string | null;
  }
> {
  try {
    const { data } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    // Fetch reviewers
    const reviewers: Array<{ login: string; avatar_url: string }> = [];
    try {
      const { data: reviews } = await octokit.rest.pulls.listReviews({
        owner,
        repo,
        pull_number: prNumber,
      });

      // Get unique reviewers who approved
      const approvedReviewers = reviews
        .filter((review) => review.state === 'APPROVED')
        .map((review) => ({
          login: review.user?.login ?? '',
          avatar_url: review.user?.avatar_url ?? '',
        }))
        .filter((r) => r.login); // Remove empty logins

      // Deduplicate by login
      const uniqueReviewers = Array.from(
        new Map(approvedReviewers.map((r) => [r.login, r])).values()
      );

      reviewers.push(...uniqueReviewers);
    } catch {
      // If we can't fetch reviews, just continue
    }

    return {
      additions: data.additions ?? 0,
      deletions: data.deletions ?? 0,
      changed_files: data.changed_files ?? 0,
      body: data.body ?? null,
      reviewers,
      merged_by: data.merged_by?.login ?? null,
      labels: (data.labels ?? []).map((label: string | { name?: string }) => ({
        name: typeof label === 'string' ? label : (label.name ?? ''),
      })),
    };
  } catch {
    // If we can't fetch details, return defaults
    return {
      additions: 0,
      deletions: 0,
      changed_files: 0,
      body: null,
      reviewers: [],
      merged_by: null,
      labels: [],
    };
  }
}

/**
 * Enrich PRs with repository metadata
 * Optionally filter by stars early to save API calls
 */
export async function enrichPRsWithMetadata(
  octokit: Octokit,
  prs: PullRequest[],
  minStars = 0
): Promise<EnrichedContribution[]> {
  const spinner = ora('Enriching PRs with repository data...').start();

  try {
    const repoCache = new Map<string, Repository>();
    const enriched: EnrichedContribution[] = [];
    let skipped = 0;

    for (let i = 0; i < prs.length; i++) {
      const pr = prs[i];
      if (!pr) {
        continue;
      }

      const prUrl = pr.html_url;

      // Extract owner and repo from PR URL
      const match = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull/);
      if (!match?.[1] || !match[2]) {
        continue;
      }

      const [, owner, repo] = match;
      const repoKey = `${owner}/${repo}`;

      spinner.text = `Enriching PRs (${enriched.length + skipped}/${prs.length})...`;

      // Fetch repo details (with cache)
      let repository = repoCache.get(repoKey);
      if (!repository) {
        await waitForRateLimit(octokit, 10);
        repository = await fetchRepository(octokit, owner, repo);
        repoCache.set(repoKey, repository);
      }

      // Early filtering: skip low-star repos to save API calls
      if (minStars > 0 && (repository.stargazers_count ?? 0) < minStars) {
        skipped++;
        continue;
      }

      // Fetch PR details for accurate stats
      await waitForRateLimit(octokit, 10);
      const prDetails = await fetchPRDetails(octokit, owner, repo, pr.number);

      enriched.push({
        repo: repoKey,
        pr_number: pr.number,
        pr_title: pr.title,
        pr_url: pr.html_url,
        pr_body: prDetails.body ?? undefined,
        merged_at: pr.merged_at ?? new Date().toISOString(),
        language: repository.language ?? null,
        repo_stars: repository.stargazers_count ?? 0,
        repo_description: repository.description ?? null,
        labels: (prDetails.labels ?? []).map((l) => l.name),
        additions: prDetails.additions ?? 0,
        deletions: prDetails.deletions ?? 0,
        files_changed: prDetails.changed_files ?? 0,
        reviewers: prDetails.reviewers,
        merged_by: prDetails.merged_by ?? undefined,
        showcase: true, // Default to showcasing
      });
    }

    if (skipped > 0) {
      spinner.succeed(
        `Enriched ${enriched.length} Pull Requests (skipped ${skipped} from low-star repos)`
      );
    } else {
      spinner.succeed(`Enriched ${enriched.length} Pull Requests`);
    }

    return enriched;
  } catch (error) {
    spinner.fail('Failed to enrich PRs');
    throw error;
  }
}
