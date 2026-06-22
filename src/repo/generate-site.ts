/**
 * Generate a minimal static HTML Page shell that mounts the remote React SPA portfolio.
 */

import type { ContributionsData } from '../types/index.js';

const SHOWCASE_UI_URL =
  'https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1/dist/showcase-ui.js';

function escapeHtml(value: string | number | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function generateSite(data: ContributionsData): string {
  const displayName = data.contributor.name ?? data.contributor.username;
  const username = data.contributor.username;
  const pageTitle = `${displayName} - Open Source Contributions`;
  const pageDesc = `Curated open source contributions by ${displayName}.`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content="${escapeHtml(pageDesc)}" />
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(pageDesc)}" />
    <meta property="og:image" content="https://github.com/${escapeHtml(username)}.png" />

    <!-- Twitter -->
    <meta property="twitter:card" content="summary" />
    <meta property="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta property="twitter:description" content="${escapeHtml(pageDesc)}" />
    <meta property="twitter:image" content="https://github.com/${escapeHtml(username)}.png" />

    <title>${escapeHtml(pageTitle)}</title>
  </head>
  <body>
    <div id="root">
      <main style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;color:#0f172a;">
        <section style="max-width:520px;text-align:center;">
          <h1 style="margin:0 0 8px;font-size:24px;line-height:1.2;">Loading open source portfolio...</h1>
          <p style="margin:0;color:#475569;line-height:1.6;">If this message stays here, the showcase UI bundle could not be loaded from the CDN.</p>
        </section>
      </main>
    </div>
    <script type="module" src="${SHOWCASE_UI_URL}" crossorigin="anonymous"></script>
  </body>
</html>`;
}
