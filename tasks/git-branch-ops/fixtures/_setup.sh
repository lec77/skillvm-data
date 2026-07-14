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
echo "v0.1" > version.txt && git add . && git commit -m "Initial version"
echo "function hello() {}" > app.ts && git add . && git commit -m "Add app module"
echo "v0.9" > version.txt && git add . && git commit -m "Bump to v0.9"
git tag v0.9
echo "export default {}" > config.ts && git add . && git commit -m "Add config"
echo "function hello() { return 'fixed' }" > app.ts && git add . && git commit -m "Add critical fix"
echo "// utils" > utils.ts && git add . && git commit -m "Add utils"
