---
name: cli-tool-debugger
description: Systematic approach to debugging CLI tools with failing tests
---

## Diagnosis Methodology

### 1. Evidence Collection

Always start by running the test suite to establish the failure pattern:

```bash
python3 -m pytest tests/ -v
```

Read the full output. Note which tests fail and what the assertion errors say.

### 2. Root Cause Analysis

Read source files systematically. Start from the failing test assertion and
trace backward through the call stack until you find the exact line where
behavior diverges from the specification. Do not guess.

### 3. Minimal Fix Principle

Fix the root cause with the smallest possible change. Never modify test files.
Never refactor unrelated code.

### 4. Verification

After applying a fix, re-run the full test suite. All tests must pass.

## Workflow

Work through each tool in order. Complete and verify each before the next.

**csv_cleaner/**
1. `cd csv_cleaner && python3 -m pytest tests/ -v`
2. Read main.py, trace the deduplication logic, fix the bug (never modify tests)
3. Re-run until all tests pass

**log_filter/**
1. `cd log_filter && python3 -m pytest tests/ -v`
2. Read main.py, trace the date filtering logic, fix the bug
3. Verify all tests pass

**data_merger/**
1. `cd data_merger && python3 -m pytest tests/ -v`
2. Read main.py, trace the merge loop, fix the bug
3. Verify all tests pass

**stats_reporter/**
1. `cd stats_reporter && python3 -m pytest tests/ -v`
2. Read main.py, trace the outlier detection logic, fix the bug
3. Verify all tests pass
