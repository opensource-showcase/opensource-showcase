/**
 * Professional project section optimized for recruiter scanning
 */

import type { EnrichedContribution } from '../types/index.js';

export function generateProjectSection(
  repo: string,
  contributions: EnrichedContribution[]
): string {
  const [owner] = repo.split('/');
  const firstContrib = contributions[0];
  if (!firstContrib) return '';

  const { repo_stars, language, repo_description } = firstContrib;
  const stars = repo_stars.toLocaleString();
  const count = contributions.length;

  // Sort by date descending
  const sorted = [...contributions].sort(
    (a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime()
  );

  // Build PR cards
  const prCards = sorted.map((pr) => generatePRCard(pr)).join('\n');

  return `
### <img src="https://github.com/${owner}.png" width="28" height="28" align="absmiddle" alt="${owner}"> [${repo}](https://github.com/${repo})

${repo_description || 'Open source project'}

**${count} contribution${count !== 1 ? 's' : ''}** • ${language ? `${language}` : ''} • **★ ${stars}**

${prCards}

---

`;
}

function generatePRCard(pr: EnrichedContribution): string {
  const date = new Date(pr.merged_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Clean PR title (remove prefixes for readability)
  const cleanTitle = pr.pr_title
    .replace(/^(feat|fix|chore|docs|refactor|test|style|perf):\s*/i, '')
    .replace(/^(feat|fix|chore|docs|refactor|test|style|perf)\(.*?\):\s*/i, '');

  const mergedIcon =
    '<img src="https://raw.githubusercontent.com/primer/octicons/main/icons/git-merge-16.svg" width="16" height="16" align="absmiddle" alt="Merged" title="Merged pull request">';
  const addBadge = `<code>+${pr.additions.toLocaleString()}</code>`;
  const delBadge = `<code>-${pr.deletions.toLocaleString()}</code>`;

  // Reviewer information
  let reviewBullet = '';
  if (pr.reviewers && pr.reviewers.length > 0) {
    const reviewerAvatars = pr.reviewers
      .slice(0, 3)
      .map(
        (r) =>
          `<img src="${r.avatar_url}" width="24" height="24" align="absmiddle" alt="${r.login}" title="${r.login}">`
      )
      .join(' ');
    reviewBullet = `- **Approved by:** ${reviewerAvatars}`;
  } else if (pr.merged_by) {
    reviewBullet = `- **Merged by:** [@${pr.merged_by}](https://github.com/${pr.merged_by})`;
  }

  const bullets = [
    `- **Changes:** ${addBadge} ${delBadge} across ${pr.files_changed.toLocaleString()} file${pr.files_changed === 1 ? '' : 's'}`,
    pr.language ? `- **Language:** ${pr.language}` : '',
    reviewBullet,
    pr.note ? `- **Impact:** ${pr.note}` : '',
  ].filter(Boolean);

  const description = formatFullDescription(pr.pr_body);

  return `---

#### ${mergedIcon} [${cleanTitle}](${pr.pr_url}) <sub>[#${pr.pr_number}](${pr.pr_url})</sub>

<sub><strong>Merged</strong> on ${date}</sub>

${bullets.join('\n')}
${description}
`;
}

function formatFullDescription(value: string | null | undefined): string {
  if (!value) return '';

  const description = value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<\/details>/gi, '&lt;/details&gt;')
    .trim();

  if (!description) return '';

  return `

<details>
<summary>View PR description</summary>

${description}

</details>
`;
}
