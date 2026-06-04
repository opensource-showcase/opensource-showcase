/**
 * Application-wide constants
 */

import type { UserConfig } from './types/index.js';

export const APP_NAME = 'opensource-showcase';
export const CONFIG_FILE_NAME = '.opensourcerc';
export const OPENSOURCE_REPO_NAME = '.opensource';
export const CONTRIBUTIONS_FILE = 'contributions.json';
export const BACKUP_FILE = 'contributions.backup.json';
export const README_FILE = 'README.md';
export const INDEX_FILE = 'index.html';
export const SHOWCASE_COMMAND_WORKFLOW_FILE = '.github/workflows/showcase-command.yml';

export const GITHUB_SCOPES = ['public_repo', 'read:user', 'workflow'] as const;

export const DEFAULT_CONFIG: UserConfig = {
  minStars: 100, // Only show repos with 100+ stars by default
  excludeTitlePatterns: ['fix typo', 'typo:', 'update dependencies', 'bump version', 'bump deps'],
  excludeBotPRs: true,
  excludeOwnRepos: true, // Exclude own repos by default
};

export const SPEC_VERSION = '1.0';

export const BOT_AUTHORS = [
  'dependabot[bot]',
  'renovate[bot]',
  'dependabot-preview[bot]',
  'snyk-bot',
  'greenkeeper[bot]',
] as const;

export const FILTER_REASONS = {
  LOW_STARS: 'low_stars',
  JUNK_TITLE: 'junk_title',
  BOT_PR: 'bot_pr',
  OWN_REPO: 'own_repo',
} as const;

export const README_TEMPLATE = `# .opensource

> 📦 My curated open source contributions

This repository follows the [\`.opensource\` specification](https://github.com/opensource-showcase/spec) - a standardized format for showcasing open source contributions.

---

## 📊 Statistics

<!--STATS_START-->
- **Total Contributions:** 0
- **Languages:** 0
- **Repositories:** 0
<!--STATS_END-->

---

## 🌟 Featured Contributions

<!--CONTRIBUTIONS_START-->
### No contributions yet

Run \`opensource-showcase\` to add your contributions!
<!--CONTRIBUTIONS_END-->

---

## 📁 File Structure

- \`contributions.json\` - Machine-readable contribution data
- \`README.md\` - This file

---

## 🔗 Links

- **Specification:** [.opensource spec](https://github.com/opensource-showcase/spec)
- **CLI Tool:** [opensource-showcase](https://github.com/opensource-showcase/cli)

---

<div align="center">
  <sub>Generated with ❤️ by <a href="https://github.com/opensource-showcase/cli">opensource-showcase CLI</a></sub>
</div>
`;
