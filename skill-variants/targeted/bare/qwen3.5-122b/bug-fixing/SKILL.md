---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

**Core rule:** Find root cause BEFORE attempting fixes. Never guess.

## Process

### 1. Investigate
- Read error messages and stack traces completely — note line numbers, file paths
- Reproduce the bug reliably
- Check recent changes (git diff, new deps, config)
- Trace data flow: where does the bad value originate? Trace backward to the source

### 2. Analyze
- Find similar working code in the codebase
- Compare working vs broken — list every difference
- Understand dependencies and assumptions

### 3. Hypothesize & Test
- Form ONE specific hypothesis: "X is the cause because Y"
- Make the SMALLEST change to test it
- One variable at a time — never fix multiple things at once
- If wrong, form a NEW hypothesis (don't stack fixes)

### 4. Fix
- Write the corrected code addressing root cause
- Run ALL existing tests to verify
- Ensure no regressions

## Red Flags — STOP if you catch yourself:
- Proposing fixes before understanding the bug
- Changing multiple things at once
- Saying "this might work" without evidence
- Skipping test verification
