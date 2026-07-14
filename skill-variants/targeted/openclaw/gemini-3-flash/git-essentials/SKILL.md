# Git Essentials

Quick reference for git operations and extracting repository data.

## Branch Operations

```bash
# IMPORTANT: If the default branch is "master", rename it to "main" first
git branch -m master main

# Create branch from a tag or commit
git checkout -b <branch-name> <tag-or-commit>

# List all branches
git branch

# Switch branch
git checkout <branch-name>
```

## Cherry-Pick

```bash
# Find a commit by message
git log --oneline --all | grep "message"

# Cherry-pick a commit onto current branch
git cherry-pick <commit-hash>
```

## Tags

```bash
# List all tags
git tag

# Create lightweight tag on current HEAD
git tag <tag-name>

# Tag a specific commit
git tag <tag-name> <commit-hash>

# Show commit at a tag
git log -1 --format="%s" <tag-name>
```

## Log & History Analysis

```bash
# Count total commits
git rev-list --count HEAD

# List unique authors sorted
git log --format="%an" | sort -u

# Count commits per author (find most active)
git shortlog -sn --no-merges HEAD
# Or count all:
git shortlog -sn HEAD

# List all unique files ever changed
git log --all --format= --name-only | sort -u | grep -v '^$'

# Get first and last commit dates (YYYY-MM-DD)
git log --reverse --format="%ad" --date=format:"%Y-%m-%d" | head -1
git log -1 --format="%ad" --date=format:"%Y-%m-%d"

# Count merge commits (commits with >1 parent)
git rev-list --merges --count HEAD

# Count commits on a specific branch
git rev-list --count <branch-name>
```

## Writing JSON Reports

When asked to write a JSON report, use a tool to create the file. Example structure:

```json
{
  "total_commits": 8,
  "authors": ["Alice", "Bob"],
  "most_active_author": "Alice",
  "files_changed": 5,
  "first_commit_date": "2026-01-10",
  "last_commit_date": "2026-01-25",
  "merge_commits": 1
}
```

**Important notes:**
- All array values should be sorted alphabetically unless specified otherwise
- Boolean fields use `true`/`false` (not strings)
- Numeric fields must be numbers (not strings) - e.g., `5` not `"5"`
- Date format: `YYYY-MM-DD`
- Write report files in the working directory root, NOT inside subdirectories like `repo/` or `project/`
- When counting "unique files changed across all commits", count every unique filename that appears in any commit's diff, deduplicated
- When counting commits on a branch, count ALL commits reachable from that branch (not just commits unique to it)
