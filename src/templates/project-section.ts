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
### <img src="https://github.com/${owner}.png" width="32" height="32" style="vertical-align: middle; border-radius: 6px; margin-right: 8px;" alt="${owner}"/> [${repo}](https://github.com/${repo})

${repo_description || 'Open source project'}

**${count} contribution${count !== 1 ? 's' : ''}** • ${language ? `${language}` : ''} • **⭐ ${stars}**

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

  // GitHub-style diff badges
  const addBadge = `![](https://img.shields.io/badge/+${pr.additions}-2da44e?style=flat-square)`;
  const delBadge = `![](https://img.shields.io/badge/-${pr.deletions}-cf222e?style=flat-square)`;

  // Reviewer information
  let reviewBullet = '';
  if (pr.reviewers && pr.reviewers.length > 0) {
    const reviewerAvatars = pr.reviewers
      .slice(0, 3)
      .map(
        (r) =>
          `<img src="${r.avatar_url}" width="28" height="28" style="border-radius: 50%; border: 2px solid #2da44e; vertical-align: middle;" alt="${r.login}" title="${r.login}"/>`
      )
      .join(' ');
    reviewBullet = `- **Approved by:** ${reviewerAvatars}`;
  } else if (pr.merged_by) {
    reviewBullet = `- **Merged by:** [@${pr.merged_by}](https://github.com/${pr.merged_by})`;
  }

  const bullets = [
    `- **Merged:** ${date}`,
    `- **Changes:** ${addBadge} ${delBadge} across ${pr.files_changed.toLocaleString()} file${pr.files_changed === 1 ? '' : 's'}`,
    pr.language ? `- **Language:** ${pr.language}` : '',
    reviewBullet,
    pr.note ? `- **Impact:** ${pr.note}` : '',
  ].filter(Boolean);

  const description = formatFullDescription(pr.pr_body);

  return `---

#### [${cleanTitle}](${pr.pr_url})

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
