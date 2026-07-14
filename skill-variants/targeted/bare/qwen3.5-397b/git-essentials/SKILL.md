---
name: git-essentials
description: Git commands for version control, branching, history analysis, and collaboration.
---

# Git Essentials

## Key Commands

### Status & Staging
```bash
git status                    # Working tree status
git add <file>                # Stage file
git add .                     # Stage all
git commit -m "message"       # Commit
git commit -am "message"      # Stage tracked + commit
git commit --amend -m "msg"   # Amend last commit
```

### Branching
```bash
git branch                    # List branches
git branch -a                 # All branches (incl. remote)
git branch <name>             # Create branch
git branch <name> <ref>       # Create branch from ref/tag/commit
git checkout -b <name>        # Create and switch
git checkout -b <name> <ref>  # Create from ref and switch
git checkout <name>           # Switch branch
git branch -d <name>          # Delete branch
git branch --show-current     # Show current branch name
```

### Merging & Cherry-pick
```bash
git merge <branch>            # Merge into current
git merge --no-ff <branch>    # Merge with merge commit
git cherry-pick <hash>        # Apply specific commit to current branch
git cherry-pick -n <hash>     # Cherry-pick without auto-commit
```

### Tags
```bash
git tag                       # List tags
git tag <name>                # Lightweight tag at HEAD
git tag <name> <ref>          # Tag specific commit/ref
git tag -a <name> -m "msg"    # Annotated tag
git push origin <tag>         # Push tag
git tag -d <name>             # Delete local tag
```

### History & Log
```bash
git log                       # Full log
git log --oneline             # One line per commit
git log --oneline --all       # All branches
git log --format="%H %an %ad %s" --date=short  # Custom: hash, author, date, subject
git log --author="Name"       # Filter by author
git log --since="2024-01-01"  # Filter by date
git log -- <file>             # File history
git log --diff-filter=A --name-only --format=""  # List added files
git log --name-only --format=""  # All changed files across commits
git rev-list --count HEAD     # Total commit count
git rev-list --count <branch> # Commits on branch
git log --merges --format=""  # List merge commits only
git log --merges --oneline    # Count merges (count output lines)
```

### Diff & Blame
```bash
git diff                      # Unstaged changes
git diff --staged             # Staged changes
git diff <a> <b>              # Between commits
git diff --name-only          # Changed file names only
git blame <file>              # Line-by-line authorship
```

### Undoing
```bash
git restore <file>            # Discard working changes
git restore --staged <file>   # Unstage
git reset --soft HEAD~1       # Undo commit, keep staged
git reset --hard HEAD~1       # Undo commit + changes
git revert <hash>             # Revert with new commit
```

### Stashing
```bash
git stash                     # Stash changes
git stash pop                 # Apply and remove
git stash list                # List stashes
```

### Remote
```bash
git remote -v                 # List remotes
git fetch origin              # Fetch
git pull                      # Fetch + merge
git push                      # Push
git push -u origin <branch>   # Push new branch
```

## Important Notes

- Always use `git branch --show-current` or check `git branch` output to determine the actual default branch name (could be `main`, `master`, or other).
- When writing JSON reports, use the actual branch/tag names from git output — do not assume names.
- Use `git log --format` for structured data extraction.
- Use `git rev-list --count` for commit counting.
- Use `--merges` flag to identify merge commits (commits with >1 parent).
- For unique file counts across history: `git log --all --name-only --format="" | sort -u | wc -l`
