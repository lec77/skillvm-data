---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

**Core rule:** Find root cause BEFORE attempting fixes. Never guess.

## Process

### 1. Investigate Root Cause
- Read error messages and stack traces completely
- Reproduce the bug consistently
- Trace data flow backward: where does the bad value originate?
- Check recent changes (git diff, new deps, config)

### 2. Analyze Pattern
- Find similar working code in the codebase
- Compare working vs broken — list every difference
- Understand all dependencies and assumptions

### 3. Hypothesis & Test
- Form one specific hypothesis: "X causes Y because Z"
- Make the SMALLEST change to test it
- One variable at a time — never fix multiple things at once
- If wrong, form new hypothesis — don't pile on more changes

### 4. Fix
- Write a failing test first (simplest reproduction)
- Implement a single fix addressing root cause
- Verify: test passes, no regressions
- If 3+ fixes fail, the architecture is wrong — redesign, don't keep patching

## Key Rules
- No fixes without investigation first
- Fix at the source, not the symptom
- One change at a time
- Test before and after every fix
