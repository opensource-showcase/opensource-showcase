import { describe, expect, it } from 'vitest';
import { generateSite } from '../src/repo/generate-site.js';
import type { ContributionsData } from '../src/types/index.js';

const data: ContributionsData = {
  version: '1.0',
  updated_at: '2026-11-17T00:00:00Z',
  contributor: {
    username: 'developer',
    name: '<Developer & Friends>',
    profile_url: 'https://github.com/developer',
  },
  contributions: [],
};

describe('generated notebook host page', () => {
  it('loads the released notebook bundle and supplies its mount point', () => {
    const html = generateSite(data);
    expect(html).toContain('https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1.1.0/dist/showcase-ui.js');
    expect(html).toContain('<div id="root">');
    expect(html).toContain('crossorigin="anonymous"');
  });

  it('escapes contributor text in page metadata', () => {
    const html = generateSite(data);
    expect(html).toContain('&lt;Developer &amp; Friends&gt; - Open Source Contributions');
    expect(html).not.toContain('<Developer & Friends>');
  });
});
