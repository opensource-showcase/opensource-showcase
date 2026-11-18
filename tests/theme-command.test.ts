import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFile, writeFile } from 'node:fs/promises';
import { issueCommand, parseShowcaseCommand } from '../src/commands/showcase.js';
import { generateCommandWorkflow } from '../src/repo/generate-command-workflow.js';

vi.mock('fs/promises', () => ({ readFile: vi.fn(), writeFile: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

describe('theme update command', () => {
  it.each(['/showcase theme update', 'showcase theme update', '/showcase theme'])('accepts %s', command => {
    expect(parseShowcaseCommand(command)).toEqual({ action: 'theme' });
  });

  it('regenerates only index.html and preserves contribution data', async () => {
    const data = {
      version: '1.0', updated_at: '2026-11-17T00:00:00Z',
      contributor: { username: 'developer', profile_url: 'https://github.com/developer' },
      contributions: [],
    };
    vi.mocked(readFile).mockResolvedValue(JSON.stringify(data));
    await issueCommand('/showcase theme update');
    expect(writeFile).toHaveBeenCalledTimes(1);
    expect(writeFile).toHaveBeenCalledWith('index.html', expect.stringContaining('data.jsdelivr.com/v1/package/resolve/npm/opensource-showcase-ui@1'), 'utf-8');
    expect(data.updated_at).toBe('2026-11-17T00:00:00Z');
  });

  it('does not write files when contribution data is invalid', async () => {
    vi.mocked(readFile).mockResolvedValue('{}');
    await expect(issueCommand('/showcase theme update')).rejects.toThrow();
    expect(writeFile).not.toHaveBeenCalled();
  });

  it('recognizes plain theme commands in generated bot workflows', () => {
    expect(generateCommandWorkflow()).toContain("contains(github.event.comment.body, 'showcase theme')");
  });
});
