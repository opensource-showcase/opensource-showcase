/**
 * Type definitions for the opensource-showcase CLI
 */

import type { Octokit } from '@octokit/rest';

/**
 * GitHub user information
 */
export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  email: string | null;
  bio: string | null;
  location: string | null;
  blog: string | null;
  twitter_username?: string | null;
  avatar_url: string;
  html_url: string;
}

/**
 * Pull Request data from GitHub API
 */
export interface PullRequest {
  number: number;
  title: string;
  html_url: string;
  merged_at?: string | null;
  user: {
    login: string;
    type: string;
  };
  labels?: Array<{
    name: string;
  }>;
  additions?: number;
  deletions?: number;
  changed_files?: number;
}

/**
 * Repository data from GitHub API
 */
export interface Repository {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  owner: {
    login: string;
  };
}

/**
 * Enriched contribution with metadata
 */
export interface EnrichedContribution {
  repo: string;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  pr_body?: string; // PR description
  merged_at: string;
  language: string | null;
  repo_stars: number;
  repo_description: string | null;
  labels: string[];
  additions: number;
  deletions: number;
  files_changed: number;
  showcase: boolean;
  note?: string;
  impact?: 'low' | 'medium' | 'high';
  reviewers?: Array<{ login: string; avatar_url: string }>; // Who reviewed/approved the PR
  merged_by?: string; // Who merged the PR
}

/**
 * Contribution with filter metadata (for UI display)
 */
export interface ContributionWithFilter extends EnrichedContribution {
  filtered?: boolean;
  filterReason?: string;
}

/**
 * Contributor information
 */
export interface Contributor {
  username: string;
  profile_url: string;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
}

/**
 * contributions.json structure following the .opensource spec
 */
export interface ContributionsData {
  version: string;
  updated_at: string;
  contributor: Contributor;
  contributions: EnrichedContribution[];
}

/**
 * User configuration from ~/.opensourcerc
 */
export interface UserConfig {
  minStars: number;
  excludeTitlePatterns: string[];
  excludeBotPRs: boolean;
  excludeOwnRepos: boolean;
}

/**
 * CLI command options
 */
export interface CLIOptions {
  all?: boolean;
  minStars?: number;
  since?: string;
  debug?: boolean;
  fresh?: boolean; // Start fresh, ignore existing contributions
}

/**
 * Filter result with reason
 */
export interface FilterResult {
  filtered: boolean;
  reason?: string;
}

/**
 * Authenticated client context
 */
export interface AuthContext {
  octokit: Octokit;
  username: string;
  user: GitHubUser;
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Fetching progress callback
 */
export type ProgressCallback = (current: number, total: number, message: string) => void;
