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
    if: github.event_name == 'workflow_dispatch' || ((github.event.issue.author_association == 'OWNER' || github.event.issue.author_association == 'MEMBER' || github.event.issue.author_association == 'COLLABORATOR' || github.event.comment.author_association == 'OWNER' || github.event.comment.author_association == 'MEMBER' || github.event.comment.author_association == 'COLLABORATOR') && (contains(github.event.issue.title, 'showcase') || contains(github.event.issue.body, '/showcase') || contains(github.event.issue.body, 'showcase add') || contains(github.event.issue.body, 'showcase remove') || contains(github.event.issue.body, 'showcase refresh') || contains(github.event.comment.body, '/showcase') || contains(github.event.comment.body, 'showcase add') || contains(github.event.comment.body, 'showcase remove') || contains(github.event.comment.body, 'showcase refresh')))
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Run showcase command
        id: run_command
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          SHOWCASE_COMMAND: \${{ github.event.comment.body || github.event.issue.body || inputs.command }}
        run: |
          set +e
          npx --yes opensource-showcase@latest command -- "$SHOWCASE_COMMAND" > showcase-command.log 2>&1
          status=$?
          cat showcase-command.log
          {
            echo "status=$status"
            echo "output<<EOF"
            tail -c 4000 showcase-command.log
            echo "EOF"
          } >> "$GITHUB_OUTPUT"
          exit "$status"

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

      - name: Add success reaction
        if: success() && github.event.issue.number
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ -n "\${{ github.event.comment.id }}" ]; then
            gh api \
              --method POST \
              -H "Accept: application/vnd.github+json" \
              "/repos/\${{ github.repository }}/issues/comments/\${{ github.event.comment.id }}/reactions" \
              -f content="rocket"
          else
            gh api \
              --method POST \
              -H "Accept: application/vnd.github+json" \
              "/repos/\${{ github.repository }}/issues/\${{ github.event.issue.number }}/reactions" \
              -f content="rocket"
          fi

      - name: Comment success
        if: success() && github.event.issue.number
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: gh issue comment "\${{ github.event.issue.number }}" --body "✅ Showcase updated."

      - name: Add failure reaction
        if: failure() && github.event.issue.number
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          if [ -n "\${{ github.event.comment.id }}" ]; then
            gh api \
              --method POST \
              -H "Accept: application/vnd.github+json" \
              "/repos/\${{ github.repository }}/issues/comments/\${{ github.event.comment.id }}/reactions" \
              -f content="confused"
          else
            gh api \
              --method POST \
              -H "Accept: application/vnd.github+json" \
              "/repos/\${{ github.repository }}/issues/\${{ github.event.issue.number }}/reactions" \
              -f content="confused"
          fi

      - name: Comment failure
        if: failure() && github.event.issue.number
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
          COMMAND_OUTPUT: \${{ steps.run_command.outputs.output }}
        run: |
          {
            echo "❌ Could not update showcase."
            echo
            echo "\`\`\`txt"
            printf '%s\\n' "$COMMAND_OUTPUT"
            echo "\`\`\`"
          } > failure-comment.md
          gh issue comment "\${{ github.event.issue.number }}" --body-file failure-comment.md
`;
}
