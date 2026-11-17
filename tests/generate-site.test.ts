import { describe, expect, it, vi } from 'vitest';
import { runInNewContext } from 'node:vm';
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
  it('tracks workflow-published UI updates and supplies its mount point', () => {
    const html = generateSite(data);
    expect(html).toContain('https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1.1.1/dist/showcase-ui.js');
    expect(html).toContain('<div id="root">');
    expect(html).toContain("cache: 'no-store'");
  });

  it('escapes contributor text in page metadata', () => {
    const html = generateSite(data);
    expect(html).toContain('&lt;Developer &amp; Friends&gt; - Open Source Contributions');
    expect(html).not.toContain('<Developer & Friends>');
  });
});

async function runLoader(version: string, failDiscovery = false, failNewest = false) {
  const html = generateSite(data);
  const script = html.match(/<script type="module">([\s\S]*?)<\/script>/)?.[1];
  if (!script) throw new Error('Missing loader');
  const loadModule = vi.fn(async (url: string) => {
    if (failNewest && url.includes('@1.2.0/')) throw new Error('CDN not ready');
  });
  const fetchVersion = vi.fn(async () => {
    if (failDiscovery) throw new Error('Offline');
    return { ok: true, json: async () => ({ version }) };
  });
  await runInNewContext(`(async () => { ${script.replace(/import\(/g, 'loadModule(')} })()`, {
    fetch: fetchVersion, loadModule, AbortController, setTimeout, clearTimeout,
  });
  return { loadModule, fetchVersion };
}

it('loads a newly published compatible UI using an exact version URL', async () => {
  const { loadModule, fetchVersion } = await runLoader('1.2.0');
  expect(loadModule).toHaveBeenCalledWith('https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1.2.0/dist/showcase-ui.js');
  expect(fetchVersion.mock.calls).toHaveLength(1);
});

it('keeps the notebook available when version discovery is offline', async () => {
  const { loadModule } = await runLoader('', true);
  expect(loadModule).toHaveBeenCalledWith('https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1.1.1/dist/showcase-ui.js');
});

it('does not import an incompatible or malformed resolved version', async () => {
  for (const version of ['2.0.0', '1.2.0/../../other']) {
    const { loadModule } = await runLoader(version);
    expect(loadModule).toHaveBeenCalledWith('https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1.1.1/dist/showcase-ui.js');
  }
});

it('falls back if a new version has not reached the CDN yet', async () => {
  const { loadModule } = await runLoader('1.2.0', false, true);
  expect(loadModule).toHaveBeenCalledTimes(2);
  expect(loadModule).toHaveBeenLastCalledWith('https://cdn.jsdelivr.net/npm/opensource-showcase-ui@1.1.1/dist/showcase-ui.js');
});
