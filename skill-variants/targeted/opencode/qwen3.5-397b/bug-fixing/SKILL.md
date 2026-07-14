---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

**NEVER guess at fixes. ALWAYS find the root cause first.**

## Process (follow in order)

### Step 1: Read the Error

- Read error messages, stack traces, and test output COMPLETELY
- Note exact line numbers, file paths, variable values
- Run the existing tests if available to see what fails

### Step 2: Understand the Code

- Read the buggy code carefully, line by line
- Trace the logic with a concrete example input
- Identify what the code ACTUALLY does vs what it SHOULD do

### Step 3: Identify the Root Cause

Common bug patterns — check these first:

| Pattern | Symptom | Fix |
|---------|---------|-----|
| Off-by-one | Array out of bounds, wrong boundary | Check `<` vs `<=`, `length` vs `length-1` |
| Race condition | Inconsistent results under concurrency | Add mutex/lock to serialize critical sections |
| Null/undefined | Crashes on missing data | Add null checks before access |
| Wrong operator | Subtle logic errors | Check `=` vs `===`, `&&` vs `||` |
| Stale closure | Old values captured | Move variable inside closure scope |
| Missing await | Promise not resolved | Add `await` before async calls |

### Step 4: Fix and Verify

1. Write the corrected code to the output file specified in the prompt
2. Make the MINIMUM change needed to fix the root cause
3. Run tests to verify the fix works
4. If tests fail, re-read the error and go back to Step 2

## Rules

- ONE fix at a time — never change multiple things at once
- Fix the ROOT CAUSE, not symptoms
- ALWAYS run tests after fixing
- If a test file exists, read it to understand expected behavior BEFORE writing your fix
