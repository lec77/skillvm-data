# Bug-Fixing Task Improvements

## Findings from Phase 1 Evaluation

Both `debug-bsearch` and `debug-race` scored 100% with AND without the skill across all runs. The verbose skill added ~29% more tokens and ~34% more time with zero quality benefit. The tasks are too easy to discriminate skill value.

### Root causes of non-differentiation

1. **Bug comments give away the answer.** `buggy-bsearch.ts` has `// BUG: should be arr.length - 1` — the fix is literally in the comment. `buggy-race.ts` has `// BUG: read` and `// BUG: write based on stale read`. Any model reads these and immediately knows what to fix.

2. **Single-point bugs are trivially patchable.** Both bugs are single-line fixes that any capable model can spot by inspection. There's no need for systematic debugging methodology when the answer is obvious.

3. **No criterion tests the debugging process.** All criteria are `bun-test` on the output file. They verify "did you produce correct code?" but not "did you identify the root cause?" or "did you avoid unnecessary changes?" A model that blindly rewrites the entire file from scratch scores the same as one that surgically identifies and fixes the bug.

## Proposed Improvements

### debug-bsearch

**Fixture changes:**
- Remove the `// BUG: should be arr.length - 1` comment. Replace with a neutral comment or no comment. The model should find the bug through analysis, not by reading the answer.
- Add a second subtle bug: integer overflow in the midpoint calculation (`(left + right) / 2` overflows for large indices). This is a classic binary search bug that tests deeper understanding. Use `left + Math.floor((right - left) / 2)` as the correct form.

**Eval criteria changes:**
- Keep existing test criteria but adjust weights to emphasize the harder cases.
- Add a test for the overflow bug (array with indices near Number.MAX_SAFE_INTEGER boundary, or large enough to demonstrate the issue).
- Weight the harder test cases more heavily.

### debug-race

**Fixture changes:**
- Remove `// BUG: read` and `// BUG: write based on stale read` comments. The model should identify the race condition through code analysis.

**Eval criteria changes:**
- Add a stress test with higher concurrency (10+ concurrent withdrawals) to verify the synchronization is robust, not just working for 2-5 concurrent calls.
- Add a test for deposit+withdraw concurrency (mixed operations) to test broader understanding.
- Adjust weights to emphasize concurrent safety more heavily.

### General principles applied

1. **Don't hand the model the answer** — remove all BUG comments from fixtures.
2. **Test deeper understanding** — add bugs that require genuine analysis, not just pattern matching.
3. **Stress-test the fix** — add higher-concurrency and mixed-operation tests that expose naive fixes.
4. **Weight discriminating criteria higher** — the easy tests (basic functionality) get lower weight; the hard tests (concurrent safety, overflow handling) get higher weight.
