---
name: git-essentials
description: Git commands for version control, branching, and history analysis.
---

# Git Essentials

## CRITICAL RULES
1. Always write output files when asked. After gathering data, WRITE the JSON file immediately.
2. When cherry-picking, first find the commit HASH using `git log main --grep="message" --format="%H"`, then use the hash with `git cherry-pick <hash>`.
3. When on a branch, `git log` only shows that branch's commits. Use `git log main` to see main branch commits.
4. Write JSON files to the WORKING DIRECTORY (parent), not inside the repo directory.

## Branch Operations

```bash
# Create branch from tag
git checkout -b branch-name tag-name

# Find commit hash by message (search specific branch)
git log main --grep="message text" --format="%H"

# Cherry-pick a commit by hash
git cherry-pick <commit-hash>

# Create lightweight tag at current HEAD
git tag v1.0

# List all branches
git branch --list --format="%(refname:short)"

# List all tags
git tag --list

# Count commits on current branch
git rev-list --count HEAD
```

## History Analysis

```bash
# Total commits
git rev-list --count --all HEAD

# All unique authors sorted
git log --format="%an" | sort -u

# Author with most commits
git shortlog -sn --all | head -1

# Unique files ever changed
git log --all --name-only --format="" | sort -u | grep -v '^$' | wc -l

# First and last commit dates
git log --format="%ad" --date=format:"%Y-%m-%d" --reverse | head -1
git log --format="%ad" --date=format:"%Y-%m-%d" -1

# Count merge commits (more than one parent)
git rev-list --merges --count --all HEAD
```

## Writing JSON Output

After collecting git data, write results to a JSON file using bash:

```bash
cat > output.json << 'JSONEOF'
{
  "key": "value",
  "count": 5,
  "items": ["a", "b"],
  "flag": true
}
JSONEOF
```

Use shell variables in JSON:
```bash
TOTAL=$(git rev-list --count HEAD)
MERGES=$(git rev-list --merges --count HEAD)
cat > report.json << EOF
{
  "total_commits": $TOTAL,
  "merge_commits": $MERGES
}
EOF
```

## Step-by-Step Patterns

### Analyze repo history → write JSON
1. `cd` into the repo directory
2. Run git commands to collect each stat
3. Store results in shell variables
4. `cd` back to working directory
5. Write JSON file using heredoc with variables

### Branch + cherry-pick + tag workflow
1. Find the target commit hash: `git log main --grep="msg" --format="%H"`
2. Create branch from tag: `git checkout -b branch tag`
3. Cherry-pick using hash: `git cherry-pick <hash>`
4. Create tag: `git tag tagname`
5. Switch back: `git checkout main`
6. Collect info and write JSON report
