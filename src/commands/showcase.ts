/**
 * Commands for maintaining an existing .opensource checkout.
 */

import { readFile, writeFile } from 'fs/promises';
import { Octokit } from '@octokit/rest';
import {
  CONTRIBUTIONS_FILE,
  INDEX_FILE,
  OPENSOURCE_REPO_NAME,
  README_FILE,
  SPEC_VERSION,
} from '../constants.js';
import { fetchPRDetails, fetchRepository } from '../github/fetch-prs.js';
import { createOctokit as createGitHubOctokit } from '../github/octokit.js';
import { generateCommandWorkflow } from '../repo/generate-command-workflow.js';
import { generateReadme } from '../repo/generate-readme.js';
import { generateSite } from '../repo/generate-site.js';
import { validateContributionsSchema } from '../repo/manage-repo.js';
import { getStoredToken } from '../utils/config.js';
import { RepositoryError, ValidationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import type { ContributionsData, EnrichedContribution } from '../types/index.js';

interface PullRequestRef {
  owner: string;
  repo: string;
  number: number;
  url: string;
}

type ShowcaseAction = 'add' | 'remove' | 'refresh';

interface ParsedCommand {
  action: ShowcaseAction;
  prUrl?: string;
}

const COMMAND_ISSUE_TITLE = 'Showcase commands';

function createGitHubClient(): Octokit {
  const token = process.env.GITHUB_TOKEN || getStoredToken();
  return createGitHubOctokit(token);
}

function parsePullRequestUrl(value: string): PullRequestRef {
  const match = value.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/);

  if (!match || !match[1] || !match[2] || !match[3]) {
    throw new ValidationError(
      'Expected a GitHub pull request URL, like https://github.com/owner/repo/pull/123'
    );
  }

  return {
    owner: match[1],
    repo: match[2],
    number: Number.parseInt(match[3], 10),
    url: `https://github.com/${match[1]}/${match[2]}/pull/${match[3]}`,
  };
}

async function loadLocalContributions(filePath = CONTRIBUTIONS_FILE): Promise<ContributionsData> {
  try {
    const content = await readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as unknown;
    validateContributionsSchema(data);
    return data as ContributionsData;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new ValidationError(
        `Could not find ${filePath}. Run this command from the .opensource repository checkout.`
      );
    }

    if (error instanceof SyntaxError) {
      throw new ValidationError(`${filePath} contains invalid JSON`);
    }

    throw error;
  }
}

async function writeLocalShowcase(data: ContributionsData): Promise<void> {
  const updated: ContributionsData = {
    ...data,
    version: data.version || SPEC_VERSION,
    updated_at: new Date().toISOString(),
  };

  await writeFile(CONTRIBUTIONS_FILE, `${JSON.stringify(updated, null, 2)}\n`, 'utf-8');
  await writeFile(
    README_FILE,
    generateReadme(updated, {
      excludeOwnRepos: true,
    }),
    'utf-8'
  );
  await writeFile(INDEX_FILE, generateSite(updated), 'utf-8');
}

async function fetchContribution(
  octokit: Octokit,
  prRef: PullRequestRef
): Promise<EnrichedContribution> {
  let pr: Awaited<ReturnType<typeof octokit.rest.pulls.get>>['data'];

  try {
    const { data } = await octokit.rest.pulls.get({
      owner: prRef.owner,
      repo: prRef.repo,
      pull_number: prRef.number,
    });
    pr = data;
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 404) {
      throw new ValidationError(
        `Could not access ${prRef.url}. Check that the PR URL is correct and the repository is public. Private repositories are not supported by the .opensource issue-command workflow.`
      );
    }

    throw error;
  }

  if (!pr.merged_at) {
    throw new ValidationError(`PR is not merged: ${prRef.url}`);
  }

  const [repository, prDetails] = await Promise.all([
    fetchRepository(octokit, prRef.owner, prRef.repo),
    fetchPRDetails(octokit, prRef.owner, prRef.repo, prRef.number),
  ]);

  return {
    repo: `${prRef.owner}/${prRef.repo}`,
    pr_number: prRef.number,
    pr_title: pr.title,
    pr_url: prRef.url,
    pr_body: prDetails.body ?? undefined,
    merged_at: pr.merged_at,
    language: repository.language,
    repo_stars: repository.stargazers_count,
    repo_description: repository.description,
    labels: (prDetails.labels ?? []).map((label) => label.name),
    additions: prDetails.additions ?? 0,
    deletions: prDetails.deletions ?? 0,
    files_changed: prDetails.changed_files ?? 0,
    reviewers: prDetails.reviewers,
    merged_by: prDetails.merged_by ?? undefined,
    showcase: true,
  };
}

function findContributionIndex(contributions: EnrichedContribution[], prUrl: string): number {
  return contributions.findIndex((contribution) => contribution.pr_url === prUrl);
}

export async function addContributionCommand(prUrl: string): Promise<void> {
  const prRef = parsePullRequestUrl(prUrl);
  const octokit = createGitHubClient();
  const data = await loadLocalContributions();
  const contribution = await fetchContribution(octokit, prRef);
  const existingIndex = findContributionIndex(data.contributions, prRef.url);

  if (existingIndex >= 0) {
    const existing = data.contributions[existingIndex];
    data.contributions[existingIndex] = {
      ...contribution,
      note: existing?.note,
      impact: existing?.impact,
      showcase: existing?.showcase ?? true,
    };
    logger.info(`Updated existing contribution ${prRef.url}`);
  } else {
    data.contributions.push(contribution);
    logger.info(`Added contribution ${prRef.url}`);
  }

  await writeLocalShowcase(data);
  logger.success('Showcase files updated');
}

export async function removeContributionCommand(prUrl: string): Promise<void> {
  const prRef = parsePullRequestUrl(prUrl);
  const data = await loadLocalContributions();
  const before = data.contributions.length;
  data.contributions = data.contributions.filter(
    (contribution) => contribution.pr_url !== prRef.url
  );

  if (data.contributions.length === before) {
    logger.warning(`Contribution was not found: ${prRef.url}`);
  } else {
    logger.info(`Removed contribution ${prRef.url}`);
  }

  await writeLocalShowcase(data);
  logger.success('Showcase files updated');
}

export async function refreshContributionsCommand(): Promise<void> {
  const octokit = createGitHubClient();
  const data = await loadLocalContributions();
  const refreshed: EnrichedContribution[] = [];

  for (const existing of data.contributions) {
    const prRef = parsePullRequestUrl(existing.pr_url);
    const contribution = await fetchContribution(octokit, prRef);
    refreshed.push({
      ...contribution,
      note: existing.note,
      impact: existing.impact,
      showcase: existing.showcase,
    });
  }

  data.contributions = refreshed;
  await writeLocalShowcase(data);
  logger.success(`Refreshed ${refreshed.length} contribution${refreshed.length === 1 ? '' : 's'}`);
}

export function parseShowcaseCommand(body: string): ParsedCommand {
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    const match = line.match(/^(?:\/|@)?showcase\s+(add|remove|refresh)(?:\s+(\S+))?/i);
    if (!match || !match[1]) continue;

    const action = match[1].toLowerCase() as ShowcaseAction;
    const prUrl = match[2];

    if ((action === 'add' || action === 'remove') && !prUrl) {
      throw new ValidationError(`Missing pull request URL for /showcase ${action}`);
    }

    return { action, prUrl };
  }

  throw new ValidationError(
    'No showcase command found. Use /showcase add <pr-url>, showcase add <pr-url>, /showcase remove <pr-url>, or /showcase refresh.'
  );
}

export async function issueCommand(body: string): Promise<void> {
  const command = parseShowcaseCommand(body);

  if (command.action === 'add' && command.prUrl) {
    await addContributionCommand(command.prUrl);
    return;
  }

  if (command.action === 'remove' && command.prUrl) {
    await removeContributionCommand(command.prUrl);
    return;
  }

  await refreshContributionsCommand();
}

export async function setupBotCommand(): Promise<void> {
  const octokit = createGitHubClient();
  const { data: user } = await octokit.rest.users.getAuthenticated();
  const workflowContent = generateCommandWorkflow();

  try {
    await octokit.rest.repos.get({
      owner: user.login,
      repo: OPENSOURCE_REPO_NAME,
    });
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 404) {
      throw new RepositoryError(
        `Could not find ${user.login}/${OPENSOURCE_REPO_NAME}. Run opensource-showcase first to create your showcase repository.`
      );
    }

    throw error;
  }

  const workflowSha = await getWorkflowFileSha(octokit, user.login);

  try {
    await upsertWorkflowFile(octokit, user.login, workflowContent, workflowSha);
  } catch (error) {
    const err = error as { status?: number; message?: string };

    if (err.status === 403 || err.status === 404) {
      throw new RepositoryError(
        'GitHub rejected creating the workflow file. Run `opensource-showcase logout`, then `opensource-showcase login` to grant the new `workflow` scope, and run `opensource-showcase setup-bot` again.'
      );
    }

    throw error;
  }

  const commandIssueUrl = await ensureCommandIssue(octokit, user.login);

  logger.success(`Issue-command bot workflow installed in ${user.login}/${OPENSOURCE_REPO_NAME}`);
  logger.info(`Command issue: ${commandIssueUrl}`);
  logger.info('Comment there with /showcase add <pr-url> or showcase add <pr-url>');
}

async function getWorkflowFileSha(octokit: Octokit, username: string): Promise<string | undefined> {
  try {
    const { data } = await octokit.request(
      'GET /repos/{owner}/{repo}/contents/.github/workflows/showcase-command.yml',
      {
        owner: username,
        repo: OPENSOURCE_REPO_NAME,
      }
    );

    return !Array.isArray(data) && 'sha' in data ? data.sha : undefined;
  } catch (error) {
    const err = error as { status?: number };
    if (err.status === 404) return undefined;
    throw error;
  }
}

async function upsertWorkflowFile(
  octokit: Octokit,
  username: string,
  content: string,
  sha: string | undefined
): Promise<void> {
  await octokit.request(
    'PUT /repos/{owner}/{repo}/contents/.github/workflows/showcase-command.yml',
    {
      owner: username,
      repo: OPENSOURCE_REPO_NAME,
      message: sha
        ? '⚙️ Update showcase command workflow'
        : '⚙️ Initialize showcase command workflow',
      content: Buffer.from(content).toString('base64'),
      sha,
    }
  );
}

async function ensureCommandIssue(octokit: Octokit, username: string): Promise<string> {
  const body = generateCommandIssueBody();
  const { data: existingIssues } = await octokit.rest.issues.listForRepo({
    owner: username,
    repo: OPENSOURCE_REPO_NAME,
    state: 'open',
    per_page: 100,
  });

  const existing = existingIssues.find((issue) => issue.title === COMMAND_ISSUE_TITLE);
  if (existing) {
    if (existing.body !== body) {
      await octokit.rest.issues.update({
        owner: username,
        repo: OPENSOURCE_REPO_NAME,
        issue_number: existing.number,
        body,
      });
    }

    return existing.html_url;
  }

  const { data: issue } = await octokit.rest.issues.create({
    owner: username,
    repo: OPENSOURCE_REPO_NAME,
    title: COMMAND_ISSUE_TITLE,
    body,
  });

  return issue.html_url;
}

function generateCommandIssueBody(): string {
  return `# Showcase command center

Use comments on this issue to update your open source showcase.

<p align="center">
  <img src="https://img.shields.io/badge/showcase-commands-0969da?style=for-the-badge" alt="Showcase commands">
</p>

## Commands

| Command | What it does |
| --- | --- |
| \`/showcase add <pr-url>\` | Adds one merged public pull request to \`contributions.json\`, then regenerates \`README.md\` and \`index.html\`. |
| \`showcase add <pr-url>\` | Same as above, without the slash. |
| \`/showcase remove <pr-url>\` | Removes that pull request from your showcase and regenerates the files. |
| \`/showcase refresh\` | Re-fetches metadata for pull requests already in your showcase: title, description, stars, language, additions, deletions, files changed, reviewers, and merge data. It does not discover or add new PRs. |

## Examples

\`\`\`txt
/showcase add https://github.com/org/repo/pull/123
showcase add https://github.com/org/repo/pull/123
/showcase remove https://github.com/org/repo/pull/123
/showcase refresh
\`\`\`

## Notes

- Only explicitly provided pull requests are added.
- Private repositories are not supported by this no-server workflow.
- Prefer \`/showcase\` or plain \`showcase\`. Avoid \`@showcase\` because it can mention a GitHub user.
- Commands are ignored unless they come from repository owners, members, or collaborators.
- The workflow reacts with 🚀 on success and 😕 on failure, then comments with the result.`;
}
