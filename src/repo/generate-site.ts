/**
 * Generate a static GitHub Pages site for curated contributions.
 */

import type { ContributionsData } from '../types/index.js';
import { renderScript, renderStyles } from './site/assets.js';
import { renderFooter, renderHero, renderMainContent } from './site/components.js';
import { calculateStats, escapeHtml, groupByRepository } from './site/utils.js';

export function generateSite(data: ContributionsData): string {
  const contributions = data.contributions.filter((contribution) => contribution.showcase);
  const stats = calculateStats(contributions);
  const grouped = groupByRepository(contributions);
  const displayName = data.contributor.name || data.contributor.username;
  const pageTitle = `${displayName} - Open Source Contributions`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="Curated open source contributions by ${escapeHtml(displayName)}." />
    <title>${escapeHtml(pageTitle)}</title>
    ${renderStyles()}
  </head>
  <body>
    ${renderHero(data.contributor, stats)}
    ${renderMainContent(grouped)}
    ${renderFooter(data.updated_at)}
    ${renderScript()}
  </body>
</html>`;
}
