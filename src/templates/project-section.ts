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

${sorted.map(pr => generatePRCard(pr)).join('\n')}

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

  // Clean and truncate description
  let description = '';
  if (pr.pr_body) {
    const cleaned = pr.pr_body
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/#{1,6}\s+/g, '')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    description = cleaned.length > 300 
      ? cleaned.substring(0, 300) + '...'
      : cleaned;
  }

  // Reviewers section
  let reviewersHtml = '';
  if (pr.reviewers && pr.reviewers.length > 0) {
    const reviewerBadges = pr.reviewers
      .map(r => `<a href="https://github.com/${r.login}"><img src="${r.avatar_url}" width="20" height="20" style="border-radius: 50%; vertical-align: middle;" alt="${r.login}" title="${r.login}"/></a>`)
      .join(' ');
    reviewersHtml = `
  <p>
    <sub>✅ <strong>Reviewed by:</strong> ${reviewerBadges}</sub>
  </p>`;
  } else if (pr.merged_by) {
    reviewersHtml = `
  <p>
    <sub>✅ <strong>Merged by:</strong> <a href="https://github.com/${pr.merged_by}">@${pr.merged_by}</a></sub>
  </p>`;
  }

  // Personal note
  const noteHtml = pr.note ? `
  <blockquote>
    <p>💡 <strong>My Impact:</strong> ${pr.note}</p>
  </blockquote>` : '';

  // Labels
  const labelsHtml = pr.labels && pr.labels.length > 0
    ? `<p>${pr.labels.slice(0, 5).map(l => `<img src="https://img.shields.io/badge/${encodeURIComponent(l.replace(/-/g, '--'))}-gray?style=flat-square" alt="${l}"/>`).join(' ')}</p>`
    : '';

  return `
<div style="padding: 16px; border-left: 4px solid #0969da; margin: 12px 0; background: #f6f8fa;">

#### [${pr.pr_title}](${pr.pr_url})

${description ? `<p>${description}</p>` : ''}

${noteHtml}
${reviewersHtml}

<p>
  <img src="https://img.shields.io/badge/📅_${encodeURIComponent(date)}-blue?style=flat-square" alt="Merged ${date}"/>
  <img src="https://img.shields.io/badge/📊_${encodeURIComponent(changes)}-success?style=flat-square" alt="Changes"/>
  ${files ? `<img src="https://img.shields.io/badge/📁_${encodeURIComponent(files)}-orange?style=flat-square" alt="${files}"/>` : ''}
  <a href="${pr.pr_url}"><img src="https://img.shields.io/badge/View_PR-→-purple?style=flat-square" alt="View PR"/></a>
</p>

${labelsHtml}

</div>
`;
}
