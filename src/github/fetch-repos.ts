/**
 * Fetch list of repositories user has contributed to
 */

import type { Octokit } from '@octokit/rest';
import ora from 'ora';
import { NetworkError, RateLimitError } from '../utils/errors.js';
import { waitForRateLimit } from '../auth/github-auth.js';

export interface ContributedRepo {
  owner: string;
  name: string;
  fullName: string;
  stars: number;
  language: string | null;
  description: string | null;
  prCount: number; // Estimated PR count
}

/**
 * Fetch list of repositories user has contributed to (lightweight, fast)
 */
export async function fetchContributedRepositories(
  octokit: Octokit,
  username: string
): Promise<ContributedRepo[]> {
  const spinner = ora('Fetching your contributed repositories...').start();

  try {
    await waitForRateLimit(octokit, 10);

    // Use search to find repos where user has PRs (fetch more to get complete list)
    const { data } = await octokit.rest.search.issuesAndPullRequests({
      q: `is:pr author:${username} is:merged`,
      per_page: 100,
      sort: 'updated',
      order: 'desc',
    });

    // Extract unique repositories
    const repoMap = new Map<string, ContributedRepo>();

    data.items.forEach((item) => {
      if (!('pull_request' in item) || !item.repository_url) return;

      // Extract owner/repo from URL
      const match = item.repository_url.match(/repos\/([^/]+)\/([^/]+)$/);
      if (!match || !match[1] || !match[2]) return;

      const [, owner, name] = match;
      const fullName = `${owner}/${name}`;

      if (!repoMap.has(fullName)) {
        repoMap.set(fullName, {
          owner,
          name,
          fullName,
          stars: 0, // Will be enriched later
          language: null,
          description: null,
          prCount: 1,
        });
      } else {
        const existing = repoMap.get(fullName);
        if (existing) {
          existing.prCount++;
        }
      }
    });

    // Now fetch metadata for each repo (in parallel, but throttled)
    const repos = Array.from(repoMap.values());
    spinner.text = `Fetching metadata for ${repos.length} repositories...`;

    // Process in batches of 5 to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < repos.length; i += batchSize) {
      const batch = repos.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (repo) => {
          try {
            await waitForRateLimit(octokit, 10);
            const { data: repoData } = await octokit.rest.repos.get({
              owner: repo.owner,
              repo: repo.name,
            });

            repo.stars = repoData.stargazers_count;
            repo.language = repoData.language;
            repo.description = repoData.description;
          } catch {
            // If we can't fetch repo, keep defaults (might be deleted/private)
          }
        })
      );
    }

    // Sort by stars (desc)
    repos.sort((a, b) => b.stars - a.stars);

    spinner.succeed(`Found ${repos.length} repositories`);
    return repos;
  } catch (error) {
    spinner.fail('Failed to fetch repositories');

    const err = error as { status?: number; message?: string };

    if (err.status === 403) {
      throw new RateLimitError(
        'GitHub API rate limit exceeded',
        Date.now() + 3600000
      );
    }

    throw new NetworkError(
      `Failed to fetch repositories: ${err.message ?? 'Unknown error'}`,
      error as Error
    );
  }
}
