# opensource-showcase

> 📦 CLI tool to curate and showcase your open source contributions

## Features

- ✅ GitHub browser login via OAuth Device Flow
- ✅ Fetch all your merged Pull Requests
- ✅ Smart filtering (low stars, trivial PRs, bots)
- ✅ Interactive selection UI
- ✅ Auto-creates public `.opensource` repository for sharing
- ✅ Enables GitHub Pages for the generated portfolio when GitHub allows it
- ✅ Generates beautiful README with organization logos and PR descriptions
- ✅ Generates a professional `index.html` portfolio page for GitHub Pages

## Installation

```bash
# Run without installing
npx opensource-showcase

# Or install globally
npm install -g opensource-showcase
```

## Quick Setup (30 seconds)

1. **Run the CLI:**
   ```bash
   opensource-showcase
   ```

2. **Approve in GitHub:**
   - The CLI opens GitHub in your browser
   - Enter the one-time code shown in the terminal
   - After approval, your GitHub login is saved locally for future runs

No manual credential setup is needed.

### Commands

```bash
opensource-showcase                    # Curate contributions (interactive)
opensource-showcase login              # Login to GitHub in your browser
opensource-showcase whoami             # Show the authenticated account
opensource-showcase status             # View current contributions  
opensource-showcase config             # View/edit configuration
opensource-showcase logout             # Clear saved GitHub login
opensource-showcase --all              # Show all PRs (no filtering)
opensource-showcase --min-stars=100    # Custom star filter
```

## Repository Visibility

The generated showcase repository should be **public** if you want people to view it or host it with GitHub Pages. This CLI creates the repository as public by default.

Keep only the CLI source repository private if you are not ready to publish the tool itself yet. The user's generated showcase page should be public because it is a portfolio.

## Configuration

Create `~/.opensourcerc`:

```json
{
  "minStars": 5,
  "excludeTitlePatterns": ["fix typo", "chore:", "update deps"],
  "excludeBotPRs": true,
  "excludeOwnRepos": true
}
```

## What Gets Generated

The CLI creates a `.opensource` repository with:

### contributions.json
Machine-readable contribution data following the [.opensource spec](../SPEC.md)

### index.html
A responsive static portfolio page ready for GitHub Pages.

### README.md
Beautiful visualization with:
- Organization logos
- PR titles and descriptions  
- Stars, languages, merge dates
- Code changes (+/-)
- Labels

## GitHub Pages

The CLI writes `index.html` and tries to enable GitHub Pages automatically from the `main` branch root.

By default, your portfolio page will be available at:

```text
https://YOUR_USERNAME.github.io/.opensource/
```

If the repository already has a custom domain configured, the CLI respects it and shows a warning. Remove the custom domain from repository Settings → Pages if you want to use the free `github.io` URL.

If GitHub Pages cannot be enabled automatically, enable it manually:

1. Open `https://github.com/YOUR_USERNAME/.opensource/settings/pages`
2. Set source to `Deploy from a branch`
3. Select the `main` branch and root folder
4. Save

### Example Output

```markdown
# 📦 Open Source Contributions

**Your Name** (@username)

15 contributions across 8 repositories

---

### 1. 🏢 [facebook/react](https://github.com/facebook/react) ⭐ 220,000

**[Fix memory leak in useEffect cleanup](https://github.com/facebook/react/pull/12345)**

Fixed a critical memory leak affecting server-side rendering...

> 💡 **My contribution:** Debugged and patched the cleanup logic

`JavaScript` • 📅 Mar 15, 2024 • [View PR →](#) • 📊 +45 -12 • `bug` `performance`
```

## Troubleshooting

**Login issues:**
- Run `opensource-showcase login` to refresh your GitHub session
- Use `opensource-showcase logout` to clear and start fresh

**No PRs found:**
- Make sure you have merged PRs to public repositories
- Check your GitHub username is correct
- Try running with `--all` to see filtered PRs

## Project Structure

```
src/
├── auth/           # GitHub OAuth
├── commands/       # CLI commands
├── filter/         # Smart filtering
├── github/         # API integration
├── repo/           # Repository & README generation
├── ui/             # Interactive terminal UI
└── utils/          # Helpers
```

## License

MIT
