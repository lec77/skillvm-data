---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
---

# Git Essentials

## Important Rules

- Always write output files to the WORKSPACE ROOT directory, not inside subdirectories. If you `cd` into a subdirectory to run git commands, write output files using absolute paths or `cd` back first.
- When counting items from git output, count the actual lines carefully. Do not guess or estimate.

## Branch Operations

```bash
# Create branch from a tag or commit
git checkout -b branch-name tag-name
git checkout -b branch-name commit-hash

# List all branches
git branch

# List all tags (sorted)
git tag
```

## Cherry-Pick

```bash
# Apply a specific commit to current branch
git cherry-pick <commit-hash>

# Find a commit by message
git log --all --oneline --grep="message text"
```

## Tags

```bash
# Create tag at current HEAD
git tag v1.0.0

# Create tag at specific commit
git tag v1.0.0 commit-hash

# List tags
git tag
```

## Analyzing Git History

```bash
# Count total commits
git rev-list --count HEAD

# List all commits with author, date, parents
git log --format="%H %an %ad %P" --date=short

# List unique authors
git log --format="%an" | sort -u

# Count commits per author
git shortlog -sn --no-merges

# Find most active author
git shortlog -sn | head -1

# Get first and last commit dates
git log --format="%ad" --date=short --reverse | head -1   # first
git log --format="%ad" --date=short | head -1              # last

# Count merge commits (commits with >1 parent)
# IMPORTANT: A merge commit has 2+ parent hashes in its %P field.
# Use --all to include all branches:
git log --all --format="%P" | awk 'NF>=2{c++} END{print c+0}'

# List all files ever changed
git log --format="" --name-only | sort -u

# Count unique files changed
git log --format="" --name-only | sort -u | grep -c .
```

## Writing JSON Reports

When writing a JSON file, pass content as a string to write_file. Double-check all numeric values by counting actual output lines.
