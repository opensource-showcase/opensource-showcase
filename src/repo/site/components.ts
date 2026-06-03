import type {
  Contributor,
  EnrichedContribution,
} from '../../types/index.js';
import type { SiteStats } from './utils.js';
import {
  cleanDescription,
  escapeHtml,
  formatDate,
  renderRichDescription,
} from './utils.js';

export function renderHero(contributor: Contributor, stats: SiteStats): string {
  const displayName = contributor.name || contributor.username;

  return `<header class="hero">
      <div class="shell">
        <div class="profile">
          <div class="identity">
            <img class="avatar" src="https://github.com/${escapeHtml(contributor.username)}.png" alt="${escapeHtml(displayName)}" />
            <div class="identity-copy">
              <h1>${escapeHtml(displayName)}</h1>
              <p class="handle"><a href="${escapeHtml(contributor.profile_url)}">@${escapeHtml(contributor.username)}</a></p>
              ${contributor.bio ? `<p class="bio">${escapeHtml(contributor.bio)}</p>` : ''}
            </div>
          </div>
          <div class="stats" aria-label="Contribution summary">
            <div class="stat"><strong>${stats.totalContributions.toLocaleString()}</strong><span>contributions</span></div>
            <div class="stat"><strong>${stats.totalProjects.toLocaleString()}</strong><span>projects</span></div>
            <div class="stat"><strong>${stats.totalLanguages.toLocaleString()}</strong><span>languages</span></div>
          </div>
        </div>
      </div>
    </header>`;
}

export function renderToolbar(languages: SiteStats['languages']): string {
  const filters =
    languages.length === 0
      ? ''
      : `<div class="filters" aria-label="Language filters">
            <button class="filter is-active" type="button" data-language="all">All</button>
            ${languages
              .map(
                (language) => `<button class="filter" type="button" data-language="${escapeHtml(language.name)}">
              ${escapeHtml(language.name)} <span>${language.count}</span>
            </button>`
              )
              .join('')}
          </div>`;

  return `<div class="toolbar">
      <div class="shell toolbar-inner">
        <input class="search" id="search" type="search" placeholder="Search repositories and pull requests" autocomplete="off" />
        ${filters}
      </div>
    </div>`;
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
  const languages = new Set(
    sorted.map((contribution) => contribution.language ?? 'Unknown')
  );

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
                <span>${first.repo_stars.toLocaleString()} stars</span>
                <span>${sorted.length} PR${sorted.length === 1 ? '' : 's'}</span>
              </div>
            </header>
            <div class="contribution-list">
              ${sorted.map(renderContributionCard).join('')}
            </div>
          </section>`;
}

export function renderContributionCard(contribution: EnrichedContribution): string {
  const description = renderRichDescription(contribution.pr_body);
  const repoDescription = cleanDescription(contribution.repo_description, 160);
  const labels = contribution.labels.slice(0, 4);
  const language = contribution.language ?? 'Unknown';
  const reviewers = contribution.reviewers?.slice(0, 5) ?? [];
  const reviewHtml =
    reviewers.length > 0
      ? `<div class="reviewed-by">
                  <span>Approved by</span>
                  <div class="reviewers">${reviewers
                    .map(
                      (reviewer) =>
                        `<a href="https://github.com/${escapeHtml(reviewer.login)}" title="${escapeHtml(reviewer.login)}"><img src="${escapeHtml(reviewer.avatar_url)}" alt="${escapeHtml(reviewer.login)}" width="24" height="24" /></a>`
                    )
                    .join('')}</div>
                </div>`
      : contribution.merged_by
        ? `<div class="reviewed-by">
                  <span>Merged by</span>
                  <a class="merged-by" href="https://github.com/${escapeHtml(contribution.merged_by)}">@${escapeHtml(contribution.merged_by)}</a>
                </div>`
        : '';

  return `<article class="contribution" data-title="${escapeHtml(contribution.pr_title)}" data-language="${escapeHtml(language)}">
                <div class="contribution-main">
                  <a class="pr-title" href="${escapeHtml(contribution.pr_url)}">${escapeHtml(contribution.pr_title)}</a>
                  ${description ? `<div class="description">${description}</div>` : repoDescription ? `<p class="description-fallback">${escapeHtml(repoDescription)}</p>` : ''}
                </div>
                ${reviewHtml}
                <div class="meta-row">
                  <span><strong>Merged</strong>${escapeHtml(formatDate(contribution.merged_at))}</span>
                  <span><strong>Language</strong>${escapeHtml(language)}</span>
                  <span><strong>Changes</strong>+${contribution.additions.toLocaleString()} / -${contribution.deletions.toLocaleString()}</span>
                  <span><strong>Files</strong>${contribution.files_changed.toLocaleString()}</span>
                </div>
                ${
                  labels.length > 0
                    ? `<div class="labels">${labels
                        .map((label) => `<span>${escapeHtml(label)}</span>`)
                        .join('')}</div>`
                    : ''
                }
              </article>`;
}

export function renderMainContent(
  grouped: Array<[string, EnrichedContribution[]]>
): string {
  return `<main class="shell">
      <div id="results">
        ${grouped.map(([repo, contributions]) => renderRepositorySection(repo, contributions)).join('')}
      </div>
      <div class="empty" id="empty" hidden>No matching contributions.</div>
    </main>`;
}

export function renderFooter(updatedAt: string): string {
  return `<footer>
      <div class="shell">
        Updated ${escapeHtml(formatDate(updatedAt))}. Data available in <a href="contributions.json">contributions.json</a>.
      </div>
    </footer>`;
}
