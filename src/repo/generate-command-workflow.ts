/**
 * Generate a GitHub Actions workflow for /showcase issue commands.
 */

export function generateCommandWorkflow(): string {
  return `name: Showcase Commands

on:
  issues:
    types: [opened, edited]
  issue_comment:
    types: [created, edited]
  workflow_dispatch:
    inputs:
      command:
        description: "Showcase command, e.g. /showcase refresh"
        required: false
        default: "/showcase refresh"

permissions:
  contents: write
  issues: write

jobs:
  showcase-command:
    runs-on: ubuntu-latest
    if: github.event_name == 'workflow_dispatch' || ((github.event.issue.author_association == 'OWNER' || github.event.issue.author_association == 'MEMBER' || github.event.issue.author_association == 'COLLABORATOR' || github.event.comment.author_association == 'OWNER' || github.event.comment.author_association == 'MEMBER' || github.event.comment.author_association == 'COLLABORATOR') && (contains(github.event.issue.title, 'showcase') || contains(github.event.issue.body, '/showcase') || contains(github.event.comment.body, '/showcase')))
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run showcase command
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SHOWCASE_COMMAND: \${{ github.event.comment.body || github.event.issue.body || inputs.command }}
        run: npx --yes opensource-showcase@latest command -- "$SHOWCASE_COMMAND"

      - name: Commit showcase updates
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add contributions.json README.md index.html
          if git diff --cached --quiet; then
            echo "No showcase changes to commit."
            exit 0
          fi
          git commit -m "Update showcase from issue command"
          git push
`;
}
