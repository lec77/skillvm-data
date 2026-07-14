---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
homepage: https://git-scm.com/
metadata: {"clawdbot":{"emoji":"🌳","requires":{"bins":["git"]}}}
---

# Git Essentials

## CRITICAL: Writing JSON Reports

When asked to write a JSON report, follow these rules exactly:
- Write the file to the WORKING DIRECTORY (where you started), NOT inside any repo subdirectory
- Use `git -C <repo-dir>` to run commands from the working directory
- Double-check every value before writing the JSON

## Counting Commits

```bash
# Total number of commits on current branch
git rev-list --count HEAD

# DO NOT use `git log | wc -l` — it counts lines, not commits
```

## Listing Authors

```bash
# Unique authors sorted alphabetically
git log --format="%an" | sort -u

# Author with most commits (prints "count name")
git shortlog -sn --all | head -1
# Extract just the name:
git shortlog -sn --all | head -1 | sed 's/^[[:space:]]*[0-9]*[[:space:]]*//'
```

## Counting Unique Files Changed

```bash
# Count unique files ever modified across ALL commits
git log --all --name-only --pretty=format: | sort -u | sed '/^$/d' | wc -l

# List those files:
git log --all --name-only --pretty=format: | sort -u | sed '/^$/d'
```

## Date Extraction

```bash
# FIRST (earliest) commit date in YYYY-MM-DD format
git log --format="%ai" --reverse | head -1 | cut -d' ' -f1

# LAST (most recent) commit date in YYYY-MM-DD format
git log --format="%ai" -1 | cut -d' ' -f1

# IMPORTANT: --reverse gives oldest first. Without --reverse, git log shows newest first.
```

## Detecting Merge Commits

```bash
# Count merge commits (commits with 2+ parents)
git rev-list --merges --count HEAD

# List merge commits
git log --merges --oneline
```

## Branching

```bash
# List all local branches
git branch --list | sed 's/^[* ] //'

# Create branch from a tag or commit
git checkout -b <branch-name> <tag-or-commit>
# Example: create release-1.0 from tag v0.9
git checkout -b release-1.0 v0.9

# Switch branches
git checkout <branch-name>
```

## Cherry-Pick

```bash
# Find commit hash by message
git log --oneline --all --grep="<message>"

# Cherry-pick a commit onto current branch
git cherry-pick <commit-hash>
```

## Tags

```bash
# List all tags sorted
git tag --sort=version:refSort | sort

# Create lightweight tag at current HEAD
git tag <tag-name>

# Create tag at specific commit
git tag <tag-name> <commit-hash>

# Get commit message at a tag
git log -1 --format="%s" <tag-name>
```

## Staging and Committing

```bash
git add <file>          # Stage specific file
git add .               # Stage all changes
git commit -m "message" # Commit with message
git commit --amend -m "new message"  # Amend last commit
```

## Viewing Changes

```bash
git status              # Show working tree status
git diff                # Unstaged changes
git diff --staged       # Staged changes
git log --oneline       # Compact log
git log --graph --oneline --all  # Visual branch graph
```

## Undoing Changes

```bash
git restore <file>           # Discard working changes
git restore --staged <file>  # Unstage
git reset --soft HEAD~1      # Undo last commit, keep changes
git revert <commit-hash>     # Create revert commit
```

## Stashing

```bash
git stash                    # Save working changes
git stash pop                # Restore and remove stash
git stash list               # List stashes
```

## Remote Operations

```bash
git fetch origin
git pull
git push
git push -u origin <branch>
```
