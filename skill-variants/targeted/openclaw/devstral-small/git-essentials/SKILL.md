---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
homepage: https://git-scm.com/
metadata: {"clawdbot":{"emoji":"🌳","requires":{"bins":["git"]}}}
---

# Git Essentials

## CRITICAL RULES — READ BEFORE DOING ANYTHING

1. **ONE command at a time.** Never chain commands with `&&`. Run each command separately.
2. **If a command fails, do NOT repeat it.** Fix the error first, then try a different command.
3. **Stay in the working directory.** Use `git -C <repo-dir> <command>` to run git commands inside a repo subdirectory. Do NOT use `cd`.
4. **Write JSON output using the `write` tool**, not `echo` or `>` redirection.
5. **Write output files to the WORKING DIRECTORY**, not inside any repo subdirectory.

## Writing JSON Reports

Always use the `write` tool to create JSON files. Build the JSON content carefully before writing.

To gather data for a report, run git commands ONE AT A TIME, collect the output from each, then write the final JSON using `write`.

## Git Commands Reference

### Counting Commits
```bash
# Count total commits
git -C <repo> rev-list --count HEAD
```

### Listing Authors
```bash
# Unique authors sorted alphabetically
git -C <repo> log --format="%an" | sort -u

# Most active author (author with most commits)
git -C <repo> shortlog -sn --all | head -1 | sed 's/^[[:space:]]*[0-9]*[[:space:]]*//'
```

### Counting Unique Files Changed
```bash
# Count unique files ever modified
git -C <repo> log --all --name-only --pretty=format: | sort -u | sed '/^$/d' | wc -l
```

### Date Extraction
```bash
# Earliest commit date (YYYY-MM-DD)
git -C <repo> log --format="%ai" --reverse | head -1 | cut -d' ' -f1

# Most recent commit date (YYYY-MM-DD)
git -C <repo> log --format="%ai" -1 | cut -d' ' -f1
```

### Detecting Merge Commits
```bash
# Count merge commits
git -C <repo> rev-list --merges --count HEAD
```

### Branching
```bash
# List all local branches
git -C <repo> branch --list | sed 's/^[* ] //'

# Create branch from a tag
git -C <repo> checkout -b <branch-name> <tag>

# Switch to a branch
git -C <repo> checkout <branch-name>
```

### Cherry-Pick
```bash
# Find commit hash by message
git -C <repo> log --oneline --all --grep="<message>"

# Cherry-pick a commit (DO NOT use -n flag)
git -C <repo> cherry-pick <commit-hash>
```

### Tags
```bash
# List all tags
git -C <repo> tag

# Create lightweight tag at current HEAD
git -C <repo> tag <tag-name>

# Get commit message at a tag
git -C <repo> log -1 --format="%s" <tag-name>
```

### Counting Commits on a Branch
```bash
# Count commits on a specific branch
git -C <repo> rev-list --count <branch-name>
```

### Staging and Committing
```bash
git -C <repo> add <file>
git -C <repo> commit -m "message"
```

### Status and Log
```bash
git -C <repo> status
git -C <repo> log --oneline
git -C <repo> diff
```

### Undoing Changes
```bash
git -C <repo> restore <file>
git -C <repo> reset --soft HEAD~1
git -C <repo> revert <commit-hash>
```

### Stashing
```bash
git -C <repo> stash
git -C <repo> stash pop
```
