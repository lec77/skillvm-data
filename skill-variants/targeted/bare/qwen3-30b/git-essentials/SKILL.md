---
name: git-essentials
description: Git commands for version control, branching, and history analysis. ALWAYS load this skill when the task involves git operations.
---

# Git Commands — Use These Exact Commands

## History Analysis

| Task | Command |
|------|---------|
| Count commits | `git rev-list --count HEAD` |
| Unique authors (sorted) | `git log --format='%an' \| sort -u` |
| Unique files modified | `git log --name-only --pretty=format: \| grep -v '^$' \| sort -u \| wc -l` |
| Most active author | `git log --format='%an' \| sort \| uniq -c \| sort -rn \| head -1 \| sed 's/^ *[0-9]* *//'` |
| Earliest commit date | `git log --format='%ad' --date=format:'%Y-%m-%d' \| tail -1` |
| Most recent commit date | `git log --format='%ad' --date=format:'%Y-%m-%d' \| head -1` |
| Count merge commits | `git rev-list --merges HEAD \| wc -l` |

`git log` outputs newest-first. So `tail -1` = earliest, `head -1` = latest.

## Branch & Tag Operations

- Create branch from tag: `git checkout -b <branch> <tag>`
- Find commit by message: `git log --all --oneline --grep='<msg>'` (use `--all`)
- Cherry-pick: `git cherry-pick <hash>`
- Lightweight tag: `git tag <name>`
- Count branch commits: `git rev-list --count <branch>`
- Commit message at tag: `git log -1 --format='%s' <tag>`
- List branches: `git branch --list`
- List tags: `git tag --list`

## CRITICAL: Writing Output Files

After collecting data, you MUST use the write_file tool to save results. Do NOT just describe the results — actually write them. Use write_file to create the JSON file with the collected values.
