/**
 * Generate beautiful README.md for .opensource repository
 * Using modular HTML templates for professional design
 */

import type { ContributionsData, EnrichedContribution } from '../types/index.js';
import { generateHeader, generateProjectSection, generateFooter } from '../templates/index.js';

interface LanguageStats {
  [language: string]: number;
}

/**
 * Calculate statistics from contributions
 */
function calculateStats(contributions: EnrichedContribution[]): {
  total: number;
  languages: LanguageStats;
  repos: number;
} {
  const languages: LanguageStats = {};
  const uniqueRepos = new Set<string>();

  contributions.forEach((c) => {
    // Count languages
    if (c.language) {
      languages[c.language] = (languages[c.language] || 0) + 1;
    }

    // Count unique repos
    uniqueRepos.add(c.repo);
  });

  return {
    total: contributions.length,
    languages,
    repos: uniqueRepos.size,
  };
}

/**
 * Group contributions by repository
 */
function groupByRepository(contributions: EnrichedContribution[]): Map<string, EnrichedContribution[]> {
  const grouped = new Map<string, EnrichedContribution[]>();
  
  contributions.forEach(contrib => {
    const existing = grouped.get(contrib.repo);
    if (existing) {
      existing.push(contrib);
    } else {
      grouped.set(contrib.repo, [contrib]);
    }
  });
  
  return grouped;
}

/**
 * Generate complete README.md content with professional design
 */
export function generateReadme(
  data: ContributionsData,
  options: {
    excludeOwnRepos?: boolean;
    limit?: number;
  } = {}
): string {
  const { excludeOwnRepos = false, limit } = options;

  // Filter out own repos if requested
  let contributions = data.contributions;
  if (excludeOwnRepos) {
    contributions = contributions.filter(c => {
      const [owner] = c.repo.split('/');
      return owner?.toLowerCase() !== data.contributor.username.toLowerCase();
    });
  }

  const stats = calculateStats(contributions);

  // Header with profile and stats
  let readme = generateHeader(data.contributor, {
    totalContributions: stats.total,
    totalProjects: stats.repos,
    totalLanguages: Object.keys(stats.languages).length,
  });

  // Featured projects section
  readme += `\n## 🌟 Featured Projects\n\n`;
  readme += `<p align="center">`;
  
  const grouped = groupByRepository(contributions);
  const topRepos = [...grouped.entries()]
    .sort((a, b) => {
      const aStars = a[1][0]?.repo_stars || 0;
      const bStars = b[1][0]?.repo_stars || 0;
      return bStars - aStars;
    })
    .slice(0, 3);

  topRepos.forEach(([repo, contribs]) => {
    const stars = (contribs[0]?.repo_stars || 0).toLocaleString();
    readme += `\n  <a href="#${repo.replace(/\//g, '')}">`; 
    readme += `<img src="https://img.shields.io/badge/${encodeURIComponent(repo)}-${stars}%20⭐-blue?style=for-the-badge&logo=github" alt="${repo}"/>`;
    readme += `</a>`;
  });

  readme += `\n</p>\n\n---\n`;

  // Contributions by project
  readme += `\n## 📦 Contributions by Project\n\n`;

  const sortedRepos = [...grouped.entries()].sort((a, b) => {
    const aStars = a[1][0]?.repo_stars || 0;
    const bStars = b[1][0]?.repo_stars || 0;
    return bStars - aStars;
  });

  const toDisplay = limit ? sortedRepos.slice(0, limit) : sortedRepos;

  toDisplay.forEach(([repo, contribs]) => {
    readme += generateProjectSection(repo, contribs);
  });

  if (limit && sortedRepos.length > limit) {
    const remaining = sortedRepos.length - limit;
    readme += `\n<div align="center">\n`;
    readme += `  <sub>Showing top ${limit} projects. ${remaining} more in <a href="contributions.json">contributions.json</a></sub>\n`;
    readme += `</div>\n\n`;
  }

  // Footer
  readme += generateFooter(data.updated_at).replace('PLACEHOLDER', data.contributor.username);

  return readme;
}
