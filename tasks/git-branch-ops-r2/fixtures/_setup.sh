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
printf '# Payments Service\n' > README.md && git add . && git commit -m "Initialize service repo"
echo "func Route(path string) string { return path }" > router.go && git add . && git commit -m "Add HTTP router"
git tag v0.9
echo "func Log(msg string) {}" > logging.go && git add . && git commit -m "Add request logging"
printf 'replicas: 2\nimage: payments:0.9\n' > deploy.yaml && git add . && git commit -m "Update deployment manifest"
echo "func Route(path string) string { return strings.TrimSuffix(path, \"/\") }" > router.go && git add . && git commit -m "Add critical fix"
echo "func Load() Config { return Config{} }" > config.go && git add . && git commit -m "Refactor config loader"
