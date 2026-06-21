import type { Contributor, EnrichedContribution } from '../../types/index.js';
import type { SiteStats } from './utils.js';
import { escapeHtml, formatDate } from './utils.js';

function stringifyScriptJson(value: string): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function renderMergeIcon(): string {
  return `<svg class="merge-icon" viewBox="0 0 16 16" aria-hidden="true">
    <path d="M5 3.25a2.25 2.25 0 1 1-2.75-2.193v9.886A2.25 2.25 0 1 1 .75 13V3.057A2.25 2.25 0 1 1 5 3.25Zm-2.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM14.75 3.25a2.25 2.25 0 0 1-3 2.122v.878A3.75 3.75 0 0 1 8 10H6.75a.75.75 0 0 1 0-1.5H8a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 1 4.5-2.122Zm-2.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z"></path>
  </svg>`;
}

export function renderHero(contributor: Contributor, _stats: SiteStats): string {
  const displayName = contributor.name ?? contributor.username;

  return `<nav class="navbar">
      <div class="shell navbar-inner">
        <div class="nav-identity">
          <img class="nav-avatar" src="https://github.com/${escapeHtml(contributor.username)}.png" alt="${escapeHtml(displayName)}" />
          <div class="nav-info">
            <span class="nav-name">${escapeHtml(displayName)}</span>
            <span class="nav-handle"><a href="${escapeHtml(contributor.profile_url)}">@${escapeHtml(contributor.username)}</a></span>
          </div>
        </div>
        <div class="nav-controls">
          <input class="search" id="search" type="search" placeholder="Search contributions..." />
        </div>
      </div>
    </nav>`;
}

export function renderMainContent(grouped: Array<[string, EnrichedContribution[]]>): string {
  return `<main class="shell">
      <div id="results">
        ${grouped.map(([repo, contributions]) => renderRepositorySection(repo, contributions)).join('')}
      </div>
      <div class="empty" id="empty" hidden>No matching contributions found.</div>
    </main>`;
}

export function renderRepositorySection(
  repo: string,
  contributions: EnrichedContribution[]
): string {
  const first = contributions[0];
  if (!first) return '';

  const sorted = [...contributions].sort(
    (a, b) => new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime()
  );
  const [owner] = repo.split('/');
  const languages = new Set(sorted.map((contribution) => contribution.language ?? 'Unknown'));

  return `<section class="repo-section" data-repo="${escapeHtml(repo)}" data-languages="${escapeHtml([...languages].join('|'))}">
            <header class="repo-header">
              <div>
                <a class="repo-name" href="https://github.com/${escapeHtml(repo)}">
                  <img src="https://github.com/${escapeHtml(owner)}.png" alt="" width="28" height="28" />
                  ${escapeHtml(repo)}
                </a>
                ${first.repo_description ? `<p>${escapeHtml(first.repo_description)}</p>` : ''}
              </div>
              <div class="repo-stats">
                <span aria-label="${first.repo_stars.toLocaleString()} stars">★ ${first.repo_stars.toLocaleString()}</span>
                <span>${sorted.length} PR${sorted.length === 1 ? '' : 's'}</span>
              </div>
            </header>
            <div class="contribution-list">
              ${sorted.map(renderContributionCard).join('')}
            </div>
          </section>`;
}

export function renderContributionCard(contribution: EnrichedContribution): string {
  const description = contribution.pr_body?.trim();
  const labels = contribution.labels.slice(0, 5);
  const language = contribution.language ?? 'Unknown';
  const reviewers = contribution.reviewers?.slice(0, 5) ?? [];

  // Simplified reviewer display
  const reviewHtml =
    reviewers.length > 0
      ? `<div class="reviewed-by">
                  <span>✅ Approved by</span>
                  <div class="reviewers">${reviewers
                    .map(
                      (reviewer) =>
                        `<a href="https://github.com/${escapeHtml(reviewer.login)}" title="${escapeHtml(reviewer.login)}"><img src="${escapeHtml(reviewer.avatar_url)}" alt="${escapeHtml(reviewer.login)}" width="24" height="24" /></a>`
                    )
                    .join('')}</div>
                </div>`
      : contribution.merged_by
        ? `<div class="reviewed-by">
                  <span>✅ Merged by</span>
                  <a class="merged-by" href="https://github.com/${escapeHtml(contribution.merged_by)}">@${escapeHtml(contribution.merged_by)}</a>
                </div>`
        : '';

  // Personal impact note
  const noteHtml = contribution.note
    ? `<div class="impact-note">
                  <span>💡 <strong>My Impact:</strong> ${escapeHtml(contribution.note)}</span>
                </div>`
    : '';

  return `<article class="contribution" data-title="${escapeHtml(contribution.pr_title)}" data-language="${escapeHtml(language)}">
                <div class="pr-heading">
                  <span class="merge-icon-wrap" title="Merged pull request">${renderMergeIcon()}</span>
                  <a class="pr-title" href="${escapeHtml(contribution.pr_url)}">${escapeHtml(contribution.pr_title)}</a>
                  <a class="pr-number" href="${escapeHtml(contribution.pr_url)}">#${contribution.pr_number.toLocaleString()}</a>
                </div>
                
                ${
                  description
                    ? `<details class="description-details">
                  <summary>📝 <strong>See description</strong></summary>
                  <script class="description-markdown" type="application/json">${stringifyScriptJson(description)}</script>
                  <div class="description markdown-body"></div>
                </details>`
                    : ''
                }
                
                ${reviewHtml}
                ${noteHtml}
                
                <ul class="pr-facts">
                  <li><strong>Merged</strong> ${escapeHtml(formatDate(contribution.merged_at))}</li>
                  <li><strong>Language</strong> ${escapeHtml(language)}</li>
                  <li class="change-fact">
                    <strong>Changes</strong>
                    <span class="diff-badge add">+${contribution.additions.toLocaleString()}</span>
                    <span class="diff-badge del">-${contribution.deletions.toLocaleString()}</span>
                  </li>
                  <li><strong>Files</strong> ${contribution.files_changed.toLocaleString()}</li>
                </ul>
                
                ${
                  labels.length > 0
                    ? `<div class="labels">${labels
                        .map((label) => `<span>${escapeHtml(label)}</span>`)
                        .join('')}</div>`
                    : ''
                }
              </article>`;
}

export function renderFooter(updatedAt: string): string {
  return `<footer>
      <div class="shell">
        Updated ${escapeHtml(formatDate(updatedAt))}. Data available in <a href="contributions.json">contributions.json</a>.
      </div>
    </footer>`;
}
