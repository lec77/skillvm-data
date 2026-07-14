---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

Find root cause BEFORE fixing. Never guess.

## Process

### 1. Investigate
- Read error messages and stack traces carefully
- Reproduce the bug consistently
- Check recent changes (git diff, config)
- Trace data flow to find where bad values originate

### 2. Analyze
- Find similar working code in the codebase
- Compare working vs broken — list every difference
- Understand dependencies and assumptions

### 3. Hypothesize and Test
- State: "I think X causes this because Y"
- Make the SMALLEST change to test one hypothesis
- If wrong, form a NEW hypothesis — don't pile on fixes

### 4. Fix
- Write a failing test first if possible
- Implement ONE fix addressing root cause
- Verify: tests pass, no regressions, issue resolved

## Rules
- NO fixes without understanding root cause first
- ONE change at a time — never fix multiple things at once
- If 3+ fixes fail, question the architecture
- Read references COMPLETELY, don't skim
