/**
 * Professional README header template with responsive navigation
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
  const { username, name, profile_url } = contributor;
  const displayName = name || username;
  const avatarUrl = `https://github.com/${username}.png`;

  return `
<div align="center">

<!-- Hero Section with Full-Width Responsive Design -->
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://user-images.githubusercontent.com/25423296/163456779-a8556205-d0a5-45e2-ac17-42d089e3c3f8.png">
  <img alt="Open Source Contributions Banner" src="https://user-images.githubusercontent.com/25423296/163456776-7fe0f349-c08d-4b11-b41a-8e40061992f8.png" width="100%" style="max-width: 100%;">
</picture>

</div>

<!-- Navigation Bar - Full Width, Responsive -->
<table width="100%" style="border: none; margin: 0; padding: 0;">
<tr>
<td width="100%" style="border: none; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 10px;">
  <table width="100%" style="border: none;">
    <tr>
      <td style="border: none; vertical-align: middle; padding: 0;">
        <a href="${profile_url}">
          <img src="${avatarUrl}" width="80" height="80" alt="${username}" style="border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"/>
        </a>
      </td>
      <td style="border: none; vertical-align: middle; padding-left: 20px;">
        <h1 style="margin: 0; color: white; font-size: 28px;">
          ${displayName}
        </h1>
        <p style="margin: 5px 0 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">
          <a href="${profile_url}" style="color: white; text-decoration: none;">@${username}</a>
        </p>
      </td>
      <td align="right" style="border: none; vertical-align: middle; padding: 0;">
        <table style="border: none;">
          <tr>
            <td align="center" style="border: none; padding: 10px;">
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; backdrop-filter: blur(10px);">
                <div style="font-size: 32px; font-weight: bold; color: white;">${stats.totalContributions}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 5px;">CONTRIBUTIONS</div>
              </div>
            </td>
            <td align="center" style="border: none; padding: 10px;">
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; backdrop-filter: blur(10px);">
                <div style="font-size: 32px; font-weight: bold; color: white;">${stats.totalProjects}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 5px;">PROJECTS</div>
              </div>
            </td>
            <td align="center" style="border: none; padding: 10px;">
              <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; backdrop-filter: blur(10px);">
                <div style="font-size: 32px; font-weight: bold; color: white;">${stats.totalLanguages}</div>
                <div style="font-size: 12px; color: rgba(255,255,255,0.8); margin-top: 5px;">LANGUAGES</div>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</td>
</tr>
</table>

<!-- Mobile-Friendly Version (Shows on narrow screens) -->
<div align="center" style="display: none;">
  <a href="${profile_url}">
    <img src="${avatarUrl}" width="120" height="120" alt="${username}" style="border-radius: 60px; border: 5px solid #667eea; margin: 20px 0;"/>
  </a>
  <h1 style="margin: 10px 0;">${displayName}</h1>
  <p style="margin: 5px 0;">
    <a href="${profile_url}" style="color: #667eea; text-decoration: none; font-size: 18px;">@${username}</a>
  </p>
  
  <table align="center" style="margin: 20px 0;">
    <tr>
      <td align="center" style="padding: 15px;">
        <div style="font-size: 28px; font-weight: bold; color: #667eea;">${stats.totalContributions}</div>
        <div style="font-size: 11px; color: #666; margin-top: 5px;">CONTRIBUTIONS</div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="font-size: 28px; font-weight: bold; color: #764ba2;">${stats.totalProjects}</div>
        <div style="font-size: 11px; color: #666; margin-top: 5px;">PROJECTS</div>
      </td>
      <td align="center" style="padding: 15px;">
        <div style="font-size: 28px; font-weight: bold; color: #667eea;">${stats.totalLanguages}</div>
        <div style="font-size: 11px; color: #666; margin-top: 5px;">LANGUAGES</div>
      </td>
    </tr>
  </table>
</div>

<br/>

<!-- Quick Navigation -->
<div align="center">
  <a href="#-featured-projects">
    <img src="https://img.shields.io/badge/🌟_Featured_Projects-blue?style=for-the-badge" alt="Featured Projects"/>
  </a>
  <a href="#-contributions-by-project">
    <img src="https://img.shields.io/badge/📦_All_Contributions-purple?style=for-the-badge" alt="All Contributions"/>
  </a>
  <a href="contributions.json">
    <img src="https://img.shields.io/badge/📄_Raw_Data-gray?style=for-the-badge" alt="Raw Data"/>
  </a>
</div>

<br/>

---
`;
}
