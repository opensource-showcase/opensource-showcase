import type { EnrichedContribution } from '../../types/index.js';

export interface SiteStats {
  totalContributions: number;
  totalProjects: number;
  totalLanguages: number;
  languages: Array<{ name: string; count: number }>;
}

export function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function cleanDescription(
  value: string | null | undefined,
  maxLength = 220
): string {
  if (!value) return '';

  const cleaned = value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();

  return cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength).trim()}...`
    : cleaned;
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function renderInlineMarkdown(value: string): string {
  let rendered = escapeHtml(value);

  rendered = rendered.replace(
    /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" />'
  );
  rendered = rendered.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,
    '<a href="$2">$1</a>'
  );
  rendered = rendered.replace(/`([^`]+)`/g, '<code>$1</code>');
  rendered = rendered.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  return rendered;
}

export function renderRichDescription(
  value: string | null | undefined,
  maxLength = 1800
): string {
  if (!value) return '';

  const withoutComments = value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();

  const clipped =
    withoutComments.length > maxLength
      ? `${withoutComments.slice(0, maxLength).trim()}\n\n...`
      : withoutComments;

  const blocks = clipped
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const heading = block.match(/^#{1,3}\s+(.+)$/);
      if (heading) {
        return `<h4>${renderInlineMarkdown(heading[1] ?? '')}</h4>`;
      }

      const image = block.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
      if (image) {
        return `<figure><img src="${escapeAttribute(image[2] ?? '')}" alt="${escapeAttribute(image[1] ?? '')}" loading="lazy" /></figure>`;
      }

      const listItems = block
        .split('\n')
        .map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1])
        .filter((line): line is string => Boolean(line));

      if (listItems.length > 0) {
        return `<ul>${listItems
          .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
          .join('')}</ul>`;
      }

      return `<p>${renderInlineMarkdown(block).replace(/\n/g, '<br />')}</p>`;
    })
    .join('');
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calculateStats(contributions: EnrichedContribution[]): SiteStats {
  const repos = new Set<string>();
  const languages = new Map<string, number>();

  contributions.forEach((contribution) => {
    repos.add(contribution.repo);

    if (contribution.language) {
      languages.set(
        contribution.language,
        (languages.get(contribution.language) ?? 0) + 1
      );
    }
  });

  return {
    totalContributions: contributions.length,
    totalProjects: repos.size,
    totalLanguages: languages.size,
    languages: [...languages.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

export function groupByRepository(
  contributions: EnrichedContribution[]
): Array<[string, EnrichedContribution[]]> {
  const grouped = new Map<string, EnrichedContribution[]>();

  contributions.forEach((contribution) => {
    const existing = grouped.get(contribution.repo) ?? [];
    existing.push(contribution);
    grouped.set(contribution.repo, existing);
  });

  return [...grouped.entries()].sort((a, b) => {
    const aStars = a[1][0]?.repo_stars ?? 0;
    const bStars = b[1][0]?.repo_stars ?? 0;
    return bStars - aStars || a[0].localeCompare(b[0]);
  });
}
