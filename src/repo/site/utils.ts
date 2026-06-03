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

  rendered = rendered.replace(/&lt;img\b([\s\S]*?)\/?&gt;/g, (_match, attrs: string) => {
    const src = attrs.match(/src=&quot;(https?:\/\/[^&]+)&quot;/)?.[1];
    if (!src) return '';

    const alt = attrs.match(/alt=&quot;([^&]*)&quot;/)?.[1] ?? '';
    const width = attrs.match(/width=&quot;(\d+)&quot;/)?.[1];
    const height = attrs.match(/height=&quot;(\d+)&quot;/)?.[1];
    const dimensions = [
      width ? `width="${width}"` : '',
      height ? `height="${height}"` : '',
    ]
      .filter(Boolean)
      .join(' ');

    return `<img src="${src}" alt="${alt}" ${dimensions} loading="lazy" />`;
  });
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

function splitMarkdownTableRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isMarkdownTable(block: string): boolean {
  const lines = block.split('\n').map((line) => line.trim());
  if (lines.length < 3) return false;

  return (
    lines[0]?.startsWith('|') === true &&
    /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[1] ?? '')
  );
}

function renderMarkdownTable(block: string): string {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  const headers = splitMarkdownTableRow(lines[0] ?? '');
  const rows = lines.slice(2).map(splitMarkdownTableRow);

  return `<div class="markdown-table-wrap"><table class="markdown-table">
        <thead><tr>${headers
          .map((header) => `<th>${renderInlineMarkdown(header)}</th>`)
          .join('')}</tr></thead>
        <tbody>${rows
          .map(
            (row) =>
              `<tr>${row
                .map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`)
                .join('')}</tr>`
          )
          .join('')}</tbody>
      </table></div>`;
}

export function renderRichDescription(
  value: string | null | undefined,
  maxLength = 12000
): string {
  if (!value) return '';

  const withoutComments = value
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .trim();

  const blocks = withoutComments
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  let remainingLength = maxLength;

  return blocks
    .map((block) => {
      if (isMarkdownTable(block)) {
        return renderMarkdownTable(block);
      }

      if (remainingLength <= 0) return '';

      const blockToRender =
        block.length > remainingLength
          ? `${block.slice(0, remainingLength).trim()}\n\n...`
          : block;
      remainingLength -= block.length;

      const heading = blockToRender.match(/^#{1,3}\s+(.+)$/);
      if (heading) {
        return `<h4>${renderInlineMarkdown(heading[1] ?? '')}</h4>`;
      }

      const image = blockToRender.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/);
      if (image) {
        return `<figure><img src="${escapeAttribute(image[2] ?? '')}" alt="${escapeAttribute(image[1] ?? '')}" loading="lazy" /></figure>`;
      }

      const listItems = blockToRender
        .split('\n')
        .map((line) => line.match(/^\s*[-*]\s+(.+)$/)?.[1])
        .filter((line): line is string => Boolean(line));

      if (listItems.length > 0) {
        return `<ul>${listItems
          .map((item) => `<li>${renderInlineMarkdown(item)}</li>`)
          .join('')}</ul>`;
      }

      return `<p>${renderInlineMarkdown(blockToRender).replace(/\n/g, '<br />')}</p>`;
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
