/**
 * Project section template with HTML styling
 */

import type { EnrichedContribution } from '../types/index.js';

export function generateProjectSection(
  repo: string,
  contributions: EnrichedContribution[]
): string {
  const [owner] = repo.split('/');
  const firstContrib = contributions[0];
  if (!firstContrib) return '';

  const { repo_stars, language } = firstContrib;
  const stars = repo_stars.toLocaleString();
  const count = contributions.length;
  const plural = count === 1 ? 'contribution' : 'contributions';

  // Sort by date descending
  const sorted = [...contributions].sort(
    (a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime()
  );

  return `
<details open>
<summary>
  <h3 style="display: inline;">
    <img src="https://github.com/${owner}.png" width="24" height="24" style="vertical-align: middle; border-radius: 4px;" alt="${owner}"/>
    <a href="https://github.com/${repo}">${repo}</a>
    <img src="https://img.shields.io/github/stars/${repo}?style=social" alt="stars"/>
  </h3>
</summary>

<blockquote>
  <p>
    <strong>${count}</strong> ${plural} • 
    ${language ? `<code>${language}</code> • ` : ''}
    ⭐ <strong>${stars}</strong> stars
  </p>
</blockquote>

${sorted.map((pr) => generatePRCard(pr)).join('\n')}

</details>

---
`;
}

function generatePRCard(pr: EnrichedContribution): string {
  const date = new Date(pr.merged_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const changes = `+${pr.additions || 0} −${pr.deletions || 0}`;
  const files = pr.files_changed ? `${pr.files_changed} files` : '';

  // Clean description properly
  let cleanedDescription = '';
  if (pr.pr_body) {
    cleanedDescription = pr.pr_body
      .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/#{1,6}\s+/g, '') // Remove markdown headers
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links but keep text
      .replace(/\n+/g, '\n') // Normalize line breaks
      .trim();
  }

  // Description with collapsible details
  const descriptionHtml = cleanedDescription
    ? `
<details>
<summary><strong>📝 See description</strong></summary>
<blockquote>
<p>${cleanedDescription}</p>
</blockquote>
</details>`
    : '';

  // Reviewers section - more compact
  let reviewersHtml = '';
  if (pr.reviewers && pr.reviewers.length > 0) {
    const reviewerBadges = pr.reviewers
      .map(
        (r) =>
          `<a href="https://github.com/${r.login}"><img src="${r.avatar_url}" width="20" height="20" style="border-radius: 50%; vertical-align: middle;" alt="${r.login}" title="${r.login}"/></a>`
      )
      .join(' ');
    reviewersHtml = `<sub>✅ Reviewed by: ${reviewerBadges}</sub>`;
  } else if (pr.merged_by) {
    reviewersHtml = `<sub>✅ Merged by: <a href="https://github.com/${pr.merged_by}">@${pr.merged_by}</a></sub>`;
  }

  // Personal note
  const noteHtml = pr.note
    ? `
<blockquote>
  <p>💡 <strong>My Impact:</strong> ${pr.note}</p>
</blockquote>`
    : '';

  // Labels - more compact
  const labelsHtml =
    pr.labels && pr.labels.length > 0
      ? pr.labels
          .slice(0, 5)
          .map(
            (l) =>
              `<img src="https://img.shields.io/badge/${encodeURIComponent(l.replace(/-/g, '--'))}-gray?style=flat-square" alt="${l}"/>`
          )
          .join(' ')
      : '';

  return `
<div style="padding: 12px 16px; border-left: 3px solid #0969da; margin: 10px 0; background: #f6f8fa; border-radius: 6px;">

<h4 style="margin: 0 0 8px 0;">
  <a href="${pr.pr_url}">${pr.pr_title}</a>
</h4>

<p style="margin: 4px 0; font-size: 0.9em;">
  <img src="https://img.shields.io/badge/📅_${encodeURIComponent(date)}-blue?style=flat-square" alt="Merged ${date}"/>
  <img src="https://img.shields.io/badge/📊_${encodeURIComponent(changes)}-success?style=flat-square" alt="Changes"/>
  ${files ? `<img src="https://img.shields.io/badge/📁_${encodeURIComponent(files)}-orange?style=flat-square" alt="${files}"/>` : ''}
</p>

${reviewersHtml ? `<p style="margin: 4px 0;">${reviewersHtml}</p>` : ''}

${labelsHtml ? `<p style="margin: 4px 0;">${labelsHtml}</p>` : ''}

${descriptionHtml}

${noteHtml}

</div>
`;
}
