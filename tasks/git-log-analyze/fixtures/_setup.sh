#!/usr/bin/env bash
# Replicates the legacy skill-bench setup() for git-log-analyze:
# a repo with known multi-author history, one feature branch, and a
# merge commit. Dates are pinned; `git init -b main` pins the branch
# name the setup's `git checkout main` step depends on.
set -e
mkdir -p project
cd project
git init -b main
git config user.email "test@example.com"
git config user.name "Alice"
echo "# Project" > README.md
git add README.md
GIT_AUTHOR_DATE="2026-01-10T10:00:00" GIT_COMMITTER_DATE="2026-01-10T10:00:00" git commit -m "Initial commit"
echo "console.log('hello')" > index.ts
git add index.ts
GIT_COMMITTER_DATE="2026-01-12T10:00:00" git -c user.name="Bob" -c user.email="bob@example.com" commit --author="Bob <bob@example.com>" -m "Add index" --date="2026-01-12T10:00:00"
echo "export function add(a,b) { return a+b }" > math.ts
git add math.ts
GIT_AUTHOR_DATE="2026-01-15T10:00:00" GIT_COMMITTER_DATE="2026-01-15T10:00:00" git commit -m "Add math module"
echo "## Usage" >> README.md
git add README.md
GIT_COMMITTER_DATE="2026-01-18T10:00:00" git -c user.name="Carol" -c user.email="carol@example.com" commit --author="Carol <carol@example.com>" -m "Update readme" --date="2026-01-18T10:00:00"
git checkout -b feature
echo "export const VERSION = '1.0'" > version.ts
git add version.ts
GIT_AUTHOR_DATE="2026-01-20T10:00:00" GIT_COMMITTER_DATE="2026-01-20T10:00:00" git commit -m "Add version"
git checkout main
echo "// config" > config.ts
git add config.ts
GIT_COMMITTER_DATE="2026-01-21T10:00:00" git -c user.name="Bob" -c user.email="bob@example.com" commit --author="Bob <bob@example.com>" -m "Add config" --date="2026-01-21T10:00:00"
GIT_AUTHOR_DATE="2026-01-22T10:00:00" GIT_COMMITTER_DATE="2026-01-22T10:00:00" git merge feature --no-ff -m "Merge feature branch"
echo "export function sub(a,b) { return a-b }" >> math.ts
git add math.ts
GIT_AUTHOR_DATE="2026-01-25T10:00:00" GIT_COMMITTER_DATE="2026-01-25T10:00:00" git commit -m "Add subtract function"
