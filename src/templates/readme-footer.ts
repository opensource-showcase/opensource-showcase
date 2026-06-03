/**
 * Professional README footer template
 */

export function generateFooter(updatedAt: string): string {
  const date = new Date(updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `

---

<div align="center">

### 📊 Contribution Stats

<img src="https://github-readme-stats.vercel.app/api?username=PLACEHOLDER&show_icons=true&theme=default" alt="GitHub Stats" />

<br/><br/>

<sub>Last updated: ${date}</sub>

<br/>

<sub>This portfolio is automatically generated using <a href="https://github.com/opensource-showcase/cli">opensource-showcase CLI</a></sub>

<br/>

<sub>View the machine-readable data: <a href="contributions.json">contributions.json</a></sub>

</div>
`;
}
