/**
 * Professional README header template
 */

import type { Contributor } from '../types/index.js';

export function generateHeader(contributor: Contributor, stats: {
  totalContributions: number;
  totalProjects: number;
  totalLanguages: number;
}): string {
  const { username, name, profile_url, bio } = contributor;
  const displayName = name || username;

  return `
<div align="center">

# 🚀 Open Source Contributions

<img src="https://github.com/${username}.png" width="120" height="120" alt="${username}" style="border-radius: 60px; border: 3px solid #0969da;"/>

### ${displayName}
[@${username}](${profile_url})

${bio ? `<p><em>${bio}</em></p>` : ''}

<br/>

<table>
  <tr>
    <td align="center">
      <img src="https://img.shields.io/badge/dynamic/json?url=https://raw.githubusercontent.com/${username}/.opensource/main/contributions.json&label=Contributions&query=$.contributions.length&color=brightgreen&style=for-the-badge&logo=github" alt="Total Contributions"/>
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/Projects-${stats.totalProjects}-blue?style=for-the-badge&logo=github" alt="Total Projects"/>
    </td>
    <td align="center">
      <img src="https://img.shields.io/badge/Languages-${stats.totalLanguages}-orange?style=for-the-badge&logo=code" alt="Languages Used"/>
    </td>
  </tr>
</table>

<br/>

<p>
  <a href="#-featured-projects">Featured Projects</a> •
  <a href="#-contributions-by-project">Contributions</a> •
  <a href="contributions.json">Raw Data</a>
</p>

</div>

---
`;
}
