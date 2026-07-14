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
echo "0.1.0" > version.txt && git add . && git commit -m "Create project skeleton"
echo "def parse(line): return line.split()" > parser.py && git add . && git commit -m "Add parser module"
printf '# Changelog\n\n## 0.9.0\n- First public preview\n' > CHANGELOG.md && echo "0.9.0" > version.txt && git add . && git commit -m "Prepare 0.9 release notes"
git tag v0.9
echo "import parser" > cli.py && git add . && git commit -m "Add CLI entrypoint"
echo "def parse(line): return line.strip().split()" > parser.py && git add . && git commit -m "Add critical fix"
echo "def test_parse(): assert True" > test_parser.py && git add . && git commit -m "Add unit tests"
