---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

**Core rule: Find root cause BEFORE writing any fix.**

## Process

### Step 1: Investigate Root Cause

1. **Read the buggy code carefully** — understand what it does line by line
2. **Trace the logic** — walk through execution with concrete inputs
3. **Identify the exact line/expression** that produces wrong behavior
4. **Understand WHY** it's wrong — don't just spot what looks off

### Step 2: Verify Understanding

- Pick a specific input that triggers the bug
- Trace execution step by step
- Confirm the bug produces the wrong result for that input
- Check if the same root cause affects other inputs/edge cases

### Step 3: Implement Fix

- Fix the root cause, not a symptom
- Make the SMALLEST change that corrects the behavior
- ONE fix at a time — never bundle multiple changes
- Preserve the original algorithm's intent and structure
- Write the corrected code to the output file specified in the prompt

### Step 4: Verify

- Trace the fixed code with the same inputs to confirm correctness
- Check edge cases: empty input, single element, boundaries, large input
- For async code: verify concurrent execution is safe

## Common Bug Patterns

**Off-by-one errors:**
- Array bounds: `length` vs `length - 1`
- Loop conditions: `<` vs `<=`
- Index initialization: 0-based vs 1-based

**Race conditions:**
- Read-then-write without atomicity on shared state
- Shared mutable state across async boundaries (await between read and write)
- Fix: serialize access with a lock/queue, or make read-check-write atomic

**Null/undefined access:**
- Check what happens when input is empty or missing
- Trace the code path for boundary values

## Key Principles

- Read the ENTIRE buggy file before proposing anything
- Preserve exports and function signatures from the original
- Test your fix mentally with multiple inputs before writing it
