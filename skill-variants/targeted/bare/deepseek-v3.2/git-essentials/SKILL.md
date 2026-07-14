---
name: git-essentials
description: Essential Git commands and workflows for version control, branching, and collaboration.
homepage: https://git-scm.com/
metadata: {"clawdbot":{"emoji":"🌳","requires":{"bins":["git"]}}}
---

# Git Essentials

## Branches
```bash
git branch                          # list branches
git branch -a                       # include remotes
git checkout -b <name>              # create & switch
git checkout -b <name> <ref>        # branch from tag/commit
git branch -d <name>               # delete (safe)
git branch -D <name>               # delete (force)
git branch -m <old> <new>          # rename
```

## Staging & Committing
```bash
git add <file>                      # stage file
git add .                           # stage all
git commit -m "msg"                 # commit
git commit -am "msg"                # add tracked + commit
git commit --amend -m "new msg"     # fix last commit msg
```

## History & Logs
```bash
git log --oneline                   # compact log
git log --oneline --all             # all branches
git log --graph --oneline --all     # visual graph
git log --author="Name"             # filter by author
git log --format="%H %an %ad %s" --date=short  # custom format
git log --since="2024-01-01"        # date filter
git log -- <file>                   # file history
git log --grep="pattern"            # search messages
git log -S "text"                   # search code changes (pickaxe)
git rev-list --count HEAD           # total commit count
git rev-list --count --merges HEAD  # count merge commits
git log --diff-filter=A --name-only --pretty=format: -- . | sort -u  # unique files ever added
git shortlog -sn                    # commits per author
git blame <file>                    # line-by-line authorship
```

## Tags
```bash
git tag                             # list tags
git tag <name>                      # lightweight tag at HEAD
git tag <name> <commit>             # tag specific commit
git tag -a <name> -m "msg"          # annotated tag
git tag -d <name>                   # delete local tag
git log -1 --format="%s" <tag>      # get commit message at tag
```

## Cherry-pick
```bash
git cherry-pick <commit-hash>       # apply commit to current branch
git cherry-pick -n <commit-hash>    # apply without committing
```

## Merging
```bash
git merge <branch>                  # merge into current
git merge --no-ff <branch>          # force merge commit
git merge --abort                   # cancel merge
```

## Diffs
```bash
git diff                            # unstaged changes
git diff --staged                   # staged changes
git diff <a> <b>                    # between refs
git diff --name-only                # changed file names only
```

## Undoing
```bash
git restore <file>                  # discard working changes
git restore --staged <file>         # unstage
git reset --soft HEAD~1             # undo commit, keep changes
git reset --hard HEAD~1             # undo commit, discard changes
git revert <hash>                   # reverse commit (new commit)
```

## Stash
```bash
git stash                           # save changes
git stash pop                       # restore & remove
git stash list                      # list stashes
```

## Remote
```bash
git fetch origin
git pull                            # fetch + merge
git push
git push -u origin <branch>         # push new branch
```

## Useful Patterns
- Count commits: `git rev-list --count HEAD`
- List unique authors: `git log --format="%an" | sort -u`
- Most active author: `git shortlog -sn --no-merges | head -1`
- Unique files ever changed: `git log --all --name-only --pretty=format: | sort -u | grep -v '^$'`
- Count merge commits: `git rev-list --merges --count HEAD`
- First/last commit date: `git log --reverse --format="%ad" --date=short | head -1` / `git log -1 --format="%ad" --date=short`
- Commit message at ref: `git log -1 --format="%s" <ref>`
- Check if commit exists on branch: `git log --oneline <branch> | grep "message"`
