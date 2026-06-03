/**
 * Smart filtering logic for contributions
 */

import { FILTER_REASONS } from '../constants.js';
import type {
  EnrichedContribution,
  ContributionWithFilter,
  FilterResult,
  UserConfig,
} from '../types/index.js';

/**
 * Check if PR title matches junk patterns
 */
function isJunkTitle(title: string, patterns: string[]): boolean {
  const lowerTitle = title.toLowerCase();
  return patterns.some((pattern) => lowerTitle.includes(pattern.toLowerCase()));
}

/**
 * Check if PR is from a bot
 */
function isBotPR(contribution: EnrichedContribution): boolean {
  // Check if any label indicates bot
  const botLabels = ['dependencies', 'dependabot', 'renovate', 'automated'];
  return contribution.labels.some((label) =>
    botLabels.some((botLabel) => label.toLowerCase().includes(botLabel))
  );
}

/**
 * Filter a single contribution based on config
 */
export function filterContribution(
  contribution: EnrichedContribution,
  config: UserConfig,
  username: string
): FilterResult {
  // Check if it's user's own repo
  if (config.excludeOwnRepos) {
    const [owner] = contribution.repo.split('/');
    if (owner?.toLowerCase() === username.toLowerCase()) {
      return {
        filtered: true,
        reason: FILTER_REASONS.OWN_REPO,
      };
    }
  }

  // Check star count
  if (contribution.repo_stars < config.minStars) {
    return {
      filtered: true,
      reason: FILTER_REASONS.LOW_STARS,
    };
  }

  // Check for junk titles
  if (isJunkTitle(contribution.pr_title, config.excludeTitlePatterns)) {
    return {
      filtered: true,
      reason: FILTER_REASONS.JUNK_TITLE,
    };
  }

  // Check for bot PRs
  if (config.excludeBotPRs && isBotPR(contribution)) {
    return {
      filtered: true,
      reason: FILTER_REASONS.BOT_PR,
    };
  }

  return { filtered: false };
}

/**
 * Apply filters to all contributions
 */
export function applyFilters(
  contributions: EnrichedContribution[],
  config: UserConfig,
  username: string,
  skipFilters = false
): ContributionWithFilter[] {
  if (skipFilters) {
    return contributions.map((c) => ({
      ...c,
      filtered: false,
    }));
  }

  return contributions.map((contribution) => {
    const filterResult = filterContribution(contribution, config, username);
    return {
      ...contribution,
      filtered: filterResult.filtered,
      filterReason: filterResult.reason,
    };
  });
}

/**
 * Get filter reason as human-readable text
 */
export function getFilterReasonText(reason?: string): string {
  switch (reason) {
    case FILTER_REASONS.LOW_STARS:
      return 'Low stars';
    case FILTER_REASONS.JUNK_TITLE:
      return 'Trivial title';
    case FILTER_REASONS.BOT_PR:
      return 'Bot PR';
    case FILTER_REASONS.OWN_REPO:
      return 'Own repository';
    default:
      return 'Filtered';
  }
}

/**
 * Get filter statistics
 */
export function getFilterStats(contributions: ContributionWithFilter[]): {
  total: number;
  filtered: number;
  shown: number;
  byReason: Record<string, number>;
} {
  const filtered = contributions.filter((c) => c.filtered);
  const byReason: Record<string, number> = {};

  filtered.forEach((c) => {
    const reason = c.filterReason ?? 'unknown';
    byReason[reason] = (byReason[reason] ?? 0) + 1;
  });

  return {
    total: contributions.length,
    filtered: filtered.length,
    shown: contributions.length - filtered.length,
    byReason,
  };
}

/**
 * Sort contributions by importance
 * Priority: repo stars desc, then merge date desc
 */
export function sortContributions(
  contributions: EnrichedContribution[]
): EnrichedContribution[] {
  return [...contributions].sort((a, b) => {
    // First sort by stars (desc)
    if (b.repo_stars !== a.repo_stars) {
      return b.repo_stars - a.repo_stars;
    }
    // Then by merge date (desc)
    return new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime();
  });
}
