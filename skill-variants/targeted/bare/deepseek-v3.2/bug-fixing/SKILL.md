---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

ALWAYS find root cause before attempting fixes. NO guessing.

## Process

### Step 1: Investigate

1. **Read the buggy code carefully** — read every line, understand the logic
2. **Read the test file** — understand what correct behavior looks like
3. **Identify the root cause** — trace the logic mentally with concrete inputs
   - For off-by-one bugs: check loop bounds, array indices, boundary conditions
   - For race conditions: check shared mutable state accessed across async boundaries
   - For logic bugs: trace with edge-case inputs (empty, single element, boundary values)

### Step 2: Fix

1. Write the corrected file to the output path specified in the prompt
2. Keep ALL exports and function signatures identical
3. Fix ONLY the root cause — do not refactor or add features
4. Preserve the original code structure as much as possible

### Step 3: Verify

Run the test file to confirm the fix works:
```
bun test <test-file>
```

If tests fail, re-read the error, re-analyze, and fix again. Do NOT guess — trace the failure.

## Common Bug Patterns

| Bug Type | What to Check |
|----------|--------------|
| Off-by-one | Array bounds: `length` vs `length - 1`, `<` vs `<=` |
| Race condition | Shared state read-then-write across `await` — needs mutex/lock |
| Null/undefined | Missing null checks before property access |
| Wrong operator | `=` vs `===`, `&&` vs `\|\|`, `>` vs `>=` |

### Race Condition Fix Pattern (TypeScript)

When async functions read shared state, `await`, then write back, concurrent calls see stale state.

**Fix:** Use a promise-based mutex so only one call executes the critical section at a time:

```typescript
let lock: Promise<void> = Promise.resolve()

export async function safeOperation(): Promise<boolean> {
  return new Promise((resolve) => {
    lock = lock.then(async () => {
      // critical section: read, check, modify shared state here
      resolve(result)
    })
  })
}
```
