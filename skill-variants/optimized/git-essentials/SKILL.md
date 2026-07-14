---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
---

# Git Essentials

Practical patterns for working with git repositories effectively. This focuses on the techniques that are easy to get wrong or forget — you already know `git add` and `git commit`.

## Extracting Information from History

These commands produce machine-parseable output, which matters when you need to build reports or analyze repositories programmatically.

### Commit counting and statistics
```bash
# Total commits (all branches merged into current)
git rev-list --count HEAD

# Commits on current branch only (not on main)
git rev-list --count main..HEAD

# Unique authors (sorted)
git log --format='%aN' | sort -u

# Commits per author (for finding most active — includes merge commits)
git shortlog -sn HEAD

# Count merge commits (commits with >1 parent)
git rev-list --merges --count HEAD
```

### File tracking across history
```bash
# All unique files ever modified across all commits
# Use --no-merges to avoid merge commit combined diffs (which can double-count files)
git log --no-merges --name-only --pretty=format: | sort -u | grep -v '^$'

# Count of unique files changed
git log --no-merges --name-only --pretty=format: | sort -u | grep -c -v '^$'
```

The `--pretty=format:` trick suppresses commit metadata so you only get filenames. The `--no-merges` flag is important because merge commits can produce combined diffs that inflate the count — the files they introduce are already counted from their original commits. The `grep -v '^$'` removes blank lines between commits (without it, `wc -l` will overcount by one per commit).

### Date extraction
```bash
# Earliest commit date (ISO format, easy to parse)
git log --reverse --format='%aI' | head -1

# Latest commit date
git log -1 --format='%aI'

# For YYYY-MM-DD only
git log --reverse --format='%as' | head -1   # first
git log -1 --format='%as'                     # last
```

Format codes: `%aI` = ISO 8601 author date, `%as` = short date (YYYY-MM-DD), `%aN` = author name.

## Branch Operations

### Creating branches from specific points
```bash
# From a tag
git checkout -b release-1.0 v0.9

# From a specific commit
git checkout -b hotfix abc1234

# Modern alternative
git switch -c release-1.0 v0.9
```

The second argument is the start point — omit it to branch from HEAD.

### Cherry-picking
```bash
# Apply a specific commit to current branch
git cherry-pick <commit-hash>

# Find a commit by message first
git log --all --oneline --grep="fix critical bug"
# Then cherry-pick the hash from the output

# Cherry-pick without auto-committing (useful to combine changes)
git cherry-pick -n <commit-hash>
```

When cherry-picking, the new commit gets a different hash than the original. The content is the same but it's a distinct commit in the history.

## Tags

```bash
# Lightweight tag (just a pointer)
git tag v1.0

# Annotated tag (includes metadata — preferred for releases)
git tag -a v1.0 -m "Version 1.0"

# Tag a specific commit
git tag v1.0 <commit-hash>

# List all tags (sorted)
git tag --sort=version:refName

# Show what commit a tag points to
git rev-parse v1.0

# Push tags to remote
git push origin v1.0       # single tag
git push --tags             # all tags
```

## Merging Strategies

```bash
# Standard merge (fast-forward if possible)
git merge feature-branch

# Force a merge commit even if fast-forward is possible
# Useful for preserving branch history in the graph
git merge --no-ff feature-branch

# Rebase instead of merge (linear history, no merge commits)
git rebase main
```

Choose `--no-ff` when you want the branch structure visible in `git log --graph`. Use rebase for a cleaner linear history. Never rebase commits that others have pulled.

## Undoing Things Safely

```bash
# Undo last commit, keep changes staged
git reset --soft HEAD~1

# Undo last commit, unstage changes (keep in working dir)
git reset HEAD~1

# Revert a commit by creating a new inverse commit (safe for shared branches)
git revert <commit-hash>

# Discard all uncommitted changes (DESTRUCTIVE)
git restore .

# Recover a deleted branch or undone commit
git reflog                          # find the commit hash
git checkout -b recovered <hash>    # recreate the branch
```

Prefer `git revert` over `git reset` on shared branches — reset rewrites history, revert adds a new commit.

## Stashing

```bash
git stash                    # save and clean working dir
git stash pop                # restore and remove from stash
git stash list               # see all stashes
git stash apply stash@{2}   # apply specific stash without removing
```

## Common Workflow Patterns

### Feature branch workflow
```bash
git checkout -b feature/foo main
# ... work ...
git add -A && git commit -m "Add foo"
git push -u origin feature/foo
# Open PR, get reviewed, merge
git checkout main && git pull
git branch -d feature/foo
```

### Syncing a fork
```bash
git remote add upstream https://github.com/original/repo.git
git fetch upstream
git merge upstream/main    # or: git rebase upstream/main
git push origin main
```

## Writing JSON Reports from Git Data

When asked to produce a JSON report from git history, a reliable pattern:

```bash
# Gather data into shell variables
total=$(git rev-list --count HEAD)
authors=$(git log --format='%aN' | sort -u)
merges=$(git rev-list --merges --count HEAD)
first_date=$(git log --reverse --format='%as' | head -1)
last_date=$(git log -1 --format='%as')

# Then write JSON (use jq, python, node, or heredoc)
```

For the files-changed count, remember that `git log --name-only` can list the same file multiple times across commits — always pipe through `sort -u` to deduplicate.
