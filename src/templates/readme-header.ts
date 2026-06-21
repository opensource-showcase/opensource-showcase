/**
 * Professional portfolio README header optimized for recruiters
 */

import type { Contributor } from '../types/index.js';

export function generateHeader(
  contributor: Contributor,
  stats: {
    totalContributions: number;
    totalProjects: number;
    totalLanguages: number;
  }
): string {
  const { username, name, profile_url, bio, location, website, twitter } = contributor;
  const displayName = name ?? username;
  const avatarUrl = `https://github.com/${username}.png`;
  const webPortfolioUrl = `https://${username}.github.io/.opensource/`;

  // Build contact links
  const links = [];
  links.push(`[GitHub](${profile_url})`);
  links.push(`[Web Portfolio](${webPortfolioUrl})`);
  if (website) links.push(`[Website](${website})`);
  if (twitter) links.push(`[Twitter](https://twitter.com/${twitter})`);

  return `<div align="center">

<img src="${avatarUrl}" width="150" height="150" alt="${displayName}" style="border-radius: 50%; border: 3px solid #0969da;"/>

# ${displayName}

**Open Source Contributor**${location ? ` • ${location}` : ''}

${bio ?? `Passionate about building impactful open source software`}

${links.join(' • ')}

---

### Portfolio Summary

</div>

<table align="center">
  <tr>
    <td align="center" width="200" style="padding: 20px;">
      <h2 style="margin: 0; font-size: 2.5em;">${stats.totalContributions}</h2>
      <p style="margin: 5px 0 0 0; font-weight: 600;">Contributions</p>
    </td>
    <td align="center" width="200" style="padding: 20px;">
      <h2 style="margin: 0; font-size: 2.5em;">${stats.totalProjects}</h2>
      <p style="margin: 5px 0 0 0; font-weight: 600;">Projects</p>
    </td>
    <td align="center" width="200" style="padding: 20px;">
      <h2 style="margin: 0; font-size: 2.5em;">${stats.totalLanguages}</h2>
      <p style="margin: 5px 0 0 0; font-weight: 600;">Languages</p>
    </td>
  </tr>
</table>

<br/>

---
`;
}
