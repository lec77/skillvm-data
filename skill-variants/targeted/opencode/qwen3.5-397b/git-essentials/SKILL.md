---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
homepage: https://git-scm.com/
metadata: {"clawdbot":{"emoji":"🌳","requires":{"bins":["git"]}}}
---

# Git Essentials

## CRITICAL RULES

1. **Output files go in the working directory root**, NOT inside any git repo subdirectory. If the repo is in `project/` or `repo/`, write output files one level up.
2. **Always chain git commands with `cd`** to avoid "not a git repository" errors. Use: `cd /path/to/repo && git ...`
3. **Remove stale lock files before git operations**: `rm -f .git/index.lock` if you hit lock errors.
4. **Run all git operations in a single bash call** when possible to avoid lock file race conditions. Chain with `&&`.

## Git History Analysis

All commands below assume you `cd` into the repo first.

```bash
# Count total commits
git rev-list --count HEAD

# List unique authors sorted
git log --format="%an" | sort -u

# Count commits per author (find most active)
git log --format="%an" | sort | uniq -c | sort -rn

# List all unique files ever modified
git log --name-only --format="" | sort -u | grep -v '^$'

# First (oldest) commit date in YYYY-MM-DD
git log --reverse --format="%ad" --date=short | head -1

# Last (newest) commit date in YYYY-MM-DD
git log -1 --format="%ad" --date=short

# Count merge commits
git rev-list --merges HEAD | wc -l
```

## Branch & Tag Operations

```bash
# Create branch from tag
git checkout -b release-1.0 v0.9

# Find commit by message and cherry-pick (chain to avoid lock issues)
HASH=$(git log --all --grep="message" --format="%H" -1) && git cherry-pick $HASH

# Create lightweight tag at HEAD
git tag v1.0

# List branches sorted
git branch --format="%(refname:short)" | sort

# List tags sorted
git tag --sort=version:refname

# Count commits on a branch
git rev-list --count branch-name

# Get commit message at a tag
git log -1 --format="%s" tag-name

# Check if commit exists on branch
git log branch-name --oneline --grep="message"
```

## Writing JSON Output

Always write output files from the working directory root, not inside the repo:

```bash
# If repo is in ./repo or ./project, cd back to parent first
cd /original/working/directory

cat > report.json << 'EOF'
{
  "key": "value"
}
EOF
```

Use the `write` tool to create JSON files when available — it avoids shell quoting issues.
