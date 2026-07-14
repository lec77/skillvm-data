---
name: git-essentials
description: Git commands for branching, tagging, cherry-picking, and history analysis.
---

# Git Essentials

## Branch Operations

```bash
# Create branch from a tag
git checkout -b BRANCH_NAME TAG_NAME

# Cherry-pick a commit by message
HASH=$(git log --all --oneline --grep="MESSAGE" --format="%H" | head -1)
git cherry-pick $HASH

# Create lightweight tag at current HEAD
git tag TAG_NAME

# List all branches (local names only)
git branch --format="%(refname:short)"

# List all tags
git tag --list
```

## History Analysis

```bash
# Total commit count
git rev-list --count HEAD

# Unique authors sorted alphabetically
git log --format="%aN" | sort -u

# Count commits per author (most active = highest count)
git shortlog -sn --all --no-merges
# The author with highest count is most active. Include merge commits too:
git log --format="%aN" | sort | uniq -c | sort -rn | head -1

# All unique files ever changed
git log --all --name-only --format="" | sort -u | grep -v '^$'

# First and last commit dates (YYYY-MM-DD)
git log --reverse --format="%ai" | head -1 | cut -d' ' -f1
git log --format="%ai" | head -1 | cut -d' ' -f1

# Count merge commits (commits with >1 parent)
git rev-list --merges --count HEAD
```

## Writing JSON Reports

When asked to write a JSON report, use bash to create the file. Example:

```bash
cat > report.json << 'JSONEOF'
{
  "key": "value",
  "count": 5,
  "items": ["a", "b"],
  "flag": true
}
JSONEOF
```

Always use actual computed values, not placeholders. Run git commands first to get the values, then write the JSON file with those values.

## Important Notes

- When working in a subdirectory repo, `cd` into it first before running git commands
- Write output JSON files in the working directory (parent), not inside the repo directory
- `git rev-list --count HEAD` counts all commits including merges
- For branch commit counts: `git rev-list --count BRANCH_NAME`
- Cherry-pick applies a commit from one branch onto the current branch
- After cherry-picking, the tip commit message matches the cherry-picked commit
