/**
 * Shared Octokit construction.
 */

import { Octokit } from '@octokit/rest';

export function createOctokit(auth?: string): Octokit {
  return new Octokit({
    auth,
    request: {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28',
      },
    },
  });
}
