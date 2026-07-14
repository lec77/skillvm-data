---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
homepage: https://git-scm.com/
metadata: {"clawdbot":{"emoji":"🌳","requires":{"bins":["git"]}}}
---

# Git Essentials

## MANDATORY RULES

1. When asked to work with a git repo, your FIRST tool call must be bash: `git -C <dir> log --oneline -5`. NEVER use glob to check for .git - glob cannot see hidden directories.

2. When writing JSON files, always write COMPLETE valid JSON. Every opening `{` needs a closing `}`. Every opening `[` needs a closing `]`. Double-check your JSON is complete before writing.

3. Write output files to the working directory, not inside the repo.

## Git History Analysis

Collect all data in one bash call:
```bash
echo "=TOTAL=" && git -C <dir> rev-list --all --count && \
echo "=AUTHORS=" && git -C <dir> log --all --format='%an' | sort -u && \
echo "=COUNTS=" && git -C <dir> shortlog -sn --all && \
echo "=FILES=" && git -C <dir> log --all --name-only --pretty=format: | sort -u | grep -v '^$' | wc -l && \
echo "=FIRST=" && git -C <dir> log --all --reverse --format='%ai' | head -1 && \
echo "=LAST=" && git -C <dir> log --all --format='%ai' | head -1 && \
echo "=MERGES=" && git -C <dir> rev-list --merges --all --count
```

Date format: `%ai` gives `YYYY-MM-DD HH:MM:SS +ZONE`. Use first 10 chars only.

Then write complete JSON:
```json
{
  "total_commits": 8,
  "authors": ["Alice", "Bob"],
  "files_changed": 5,
  "most_active_author": "Alice",
  "first_commit_date": "2026-01-10",
  "last_commit_date": "2026-01-25",
  "merge_commits": 1
}
```

## Branch Operations

Step 1 - Create branch from tag:
```bash
git -C <dir> checkout -b <branch> <tag>
```

Step 2 - Cherry-pick a commit (find hash first from the log output, then pick):
```bash
git -C <dir> cherry-pick <hash>
```

Step 3 - Tag current HEAD:
```bash
git -C <dir> tag <tagname>
```

Step 4 - Count commits on current branch (IMPORTANT: use rev-list --count HEAD after checkout to the branch):
```bash
git -C <dir> rev-list --count HEAD
```

Step 5 - Collect all info for report:
```bash
echo "=BRANCHES=" && git -C <dir> branch --format='%(refname:short)' | sort && \
echo "=TAGS=" && git -C <dir> tag | sort && \
echo "=COMMITS=" && git -C <dir> rev-list --count HEAD && \
echo "=MSG=" && git -C <dir> log -1 --format='%s'
```

Then write complete JSON:
```json
{
  "branches": ["main", "release-1.0"],
  "tags": ["v0.9", "v1.0"],
  "release_branch_commits": 4,
  "v1_0_message": "Add critical fix",
  "cherry_picked": true
}
```

## Reference

| Task | Command |
|------|---------|
| Commit count | `git -C <dir> rev-list --count HEAD` |
| All branches | `git -C <dir> branch --format='%(refname:short)'` |
| All tags | `git -C <dir> tag` |
| Merge count | `git -C <dir> rev-list --merges --all --count` |
| Authors | `git -C <dir> log --all --format='%an' \| sort -u` |
| Files changed | `git -C <dir> log --all --name-only --pretty=format: \| sort -u \| grep -v '^$'` |
| Commit message | `git -C <dir> log -1 --format='%s'` |
| Cherry-pick | `git -C <dir> cherry-pick <hash>` |
