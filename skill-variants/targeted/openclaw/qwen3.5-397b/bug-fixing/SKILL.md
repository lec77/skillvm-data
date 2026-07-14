---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Bug Fixing

Do NOT ask the user questions. Act autonomously: read code, identify bug, write fix, verify.

## Procedure

1. **Read** the buggy file completely
2. **Identify** the root cause — trace the logic, don't guess
3. **Write** the corrected file with ONLY the bug fixed (minimal change)
4. **Verify** by running `bun test` if test files exist

## Writing Files

**NO LINE NUMBERS.** The read tool shows `N: code` prefixes — these are display-only. Write raw source code without any prefixes.

**WRONG:** `1: export function foo() {`
**CORRECT:** `export function foo() {`

**COMPLETE FILES.** Always write the entire file including all closing braces. Never truncate.

**MINIMAL CHANGES.** Fix only the bug. Do not restructure, add features, or refactor.

## Common Bug Patterns

- **Off-by-one:** `arr.length` vs `arr.length - 1` for array bounds
- **Race condition:** Reading shared state before async work, then writing based on stale read. Fix with a mutex/lock or atomic compare-and-swap pattern to serialize concurrent access.
- **Integer overflow:** `(a + b) / 2` vs `a + (b - a) / 2` for midpoint calculation
- **Boundary errors:** Missing checks for empty input, null values, or edge cases
