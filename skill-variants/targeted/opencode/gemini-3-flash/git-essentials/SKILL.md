---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
homepage: https://git-scm.com/
metadata: {"clawdbot":{"emoji":"🌳","requires":{"bins":["git"]}}}
---

# Git Essentials

IMPORTANT: The git repo may be in a subdirectory. Always `cd` into the repo directory (where `.git/` exists) before running git commands. Use `bash` to run all commands.

## Analyzing Git History

```bash
# Total commits
git rev-list --count HEAD

# Unique authors (sorted alphabetically)
git log --format='%aN' | sort -u

# Most active author (highest commit count)
git shortlog -sn --no-merges HEAD
# The first line is the most active author

# Count merge commits (commits with >1 parent)
git rev-list --merges --count HEAD

# All unique files ever changed (exclude merge commits to avoid double-counting)
git log --no-merges --name-only --pretty=format: | sort -u | grep -v '^$'

# Count unique files
git log --no-merges --name-only --pretty=format: | sort -u | grep -c -v '^$'

# First commit date (YYYY-MM-DD)
git log --reverse --format='%as' | head -1

# Last commit date (YYYY-MM-DD)
git log -1 --format='%as'
```

Format codes: `%aN` = author name, `%as` = short date (YYYY-MM-DD), `%aI` = ISO date.

## Branch Operations

```bash
# Create branch from a tag or commit
git checkout -b release-1.0 v0.9

# List all branch names
git branch --format='%(refname:short)'

# Count commits on a branch
git rev-list --count release-1.0
```

## Cherry-Picking

```bash
# Find a commit by message
git log --all --oneline --grep="fix critical"

# Cherry-pick by hash
git cherry-pick <hash>
```

After cherry-picking, the commit exists on the current branch with a new hash but same message.

## Tags

```bash
# Create lightweight tag on current HEAD
git tag v1.0

# List all tags (sorted)
git tag --sort=version:refName

# Show commit message at a tag
git log -1 --format='%s' v1.0
```

## Writing JSON Reports

When writing a JSON report from git data, gather values into variables first, then write JSON. All numeric values must be numbers (not strings).

```bash
cd <repo-dir>
total=$(git rev-list --count HEAD)
merges=$(git rev-list --merges --count HEAD)
first_date=$(git log --reverse --format='%as' | head -1)
last_date=$(git log -1 --format='%as')

# Write JSON using node for correct types
node -e "
const fs = require('fs');
fs.writeFileSync('../report.json', JSON.stringify({
  total_commits: $total,
  merge_commits: $merges,
  first_commit_date: '$first_date',
  last_commit_date: '$last_date'
}, null, 2));
"
```

CRITICAL: Numbers like total_commits must be JSON numbers (no quotes). Use node/python/jq to ensure correct types. Write the JSON file to the working directory (parent of repo), not inside the repo.
