#!/usr/bin/env bash
# Replicates the legacy skill-bench setup() for git-branch-ops:
# a repo with 6 commits and tag v0.9. `git init -b main` pins the
# default branch name the grader expects.
set -e
mkdir -p repo
cd repo
git init -b main
git config user.email "test@example.com"
git config user.name "Dev"
echo "<html><body><div id=app></div></body></html>" > index.html && git add . && git commit -m "Scaffold web client"
echo "export const get = (url: string) => fetch(url)" > api.ts && git add . && git commit -m "Add fetch helper"
echo "export function Banner(msg: string) { return msg }" > banner.ts && git add . && git commit -m "Add error banner component"
echo "0.9.0" > VERSION && git add . && git commit -m "Cut 0.9 beta"
git tag v0.9
echo "export const get = (url: string) => fetch(url, { credentials: 'omit' })" > api.ts && git add . && git commit -m "Add critical fix"
printf '# Web Client\n\nRun `npm start` to boot the dev server.\n' > README.md && git add . && git commit -m "Polish README"
