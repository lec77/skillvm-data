---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
---

# Git Essentials

## Analyzing Git History — Producing JSON Reports

When analyzing a git repo and writing a JSON report, use these exact commands inside the repo directory:

```bash
# Total commits on current branch
git rev-list --count HEAD

# Unique authors sorted alphabetically
git log --format='%aN' | sort -u

# Most active author (first line of shortlog = most commits)
git shortlog -sn HEAD | head -1
# Parse: strip leading whitespace and count, keep only the name

# Count unique files ever modified (CRITICAL: use --no-merges to avoid merge double-counting)
git log --no-merges --name-only --pretty=format: | sort -u | grep -v '^$' | wc -l

# First commit date (YYYY-MM-DD)
git log --reverse --format='%as' | head -1

# Last commit date (YYYY-MM-DD)
git log -1 --format='%as'

# Count merge commits
git rev-list --merges --count HEAD
```

**IMPORTANT rules:**
- Write output JSON to the working directory, NOT inside the repo subdirectory
- `files_changed` counts unique filenames across all non-merge commits via `sort -u`
- `authors` is a sorted array: `["Alice", "Bob", "Carol"]`
- Dates use YYYY-MM-DD format (git format `%as`)
- For `most_active_author`, parse `git shortlog -sn` — the name follows the count number

## Branch Operations

```bash
# Create branch from a tag
git checkout -b release-1.0 v0.9

# Find commit by message, then cherry-pick
git log --all --oneline --grep="Add critical fix"
git cherry-pick <hash>

# Create lightweight tag on current HEAD
git tag v1.0

# Get commit message at a tag
git log -1 --format='%s' v1.0

# Count commits on a branch
git rev-list --count release-1.0

# List all branch names sorted
git branch --format='%(refname:short)' | sort

# List all tags sorted
git tag --sort=version:refname
```

## Writing Valid JSON

Use node or python to write JSON with dynamic values:

```bash
node -e "
const data = { key: 'value', count: 5, items: ['a','b'], flag: true };
require('fs').writeFileSync('output.json', JSON.stringify(data, null, 2));
"
```

Or use a heredoc for static JSON:
```bash
cat > output.json << 'EOF'
{
  "key": "value",
  "count": 5
}
EOF
```
