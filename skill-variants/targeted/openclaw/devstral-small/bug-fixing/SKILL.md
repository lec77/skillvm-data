---
name: bug-fixing
description: Fix bugs in code by reading, identifying root cause, and writing corrected files
---

# Bug Fixing

## Process

1. **Read** the buggy file using the `read` tool
2. **Identify** the root cause of the bug
3. **Write** the fixed file using the `write` tool — NEVER just show code in chat

**CRITICAL: You MUST use the `write` tool to create the output file. Do NOT just print code.**

## Common Bug Patterns

### Off-by-one in binary search
**Bug:** `right = arr.length` should be `right = arr.length - 1`
**Why:** With `right = arr.length`, `arr[mid]` can access out-of-bounds index, and the loop condition `left <= right` allows an extra iteration.

### Race condition in async code
**Bug:** Reading shared state, doing async work, then writing — multiple callers read stale values.
**Fix:** Use a promise-based queue/mutex so only one caller runs at a time.

```typescript
// Mutex pattern for async race conditions
let lock: Promise<void> = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  let result = false
  lock = lock.then(async () => {
    const current = balance
    await new Promise((r) => setTimeout(r, 1))
    if (current >= amount) {
      balance = current - amount
      result = true
    }
  })
  await lock
  return result
}
```

**Key insight:** A boolean flag lock does NOT work because checking and setting the flag is not atomic in async JS. Use promise chaining instead.

## Rules

- Always read the buggy file first
- Always write the fixed file using the `write` tool
- Keep the same function signatures and exports
- Do NOT add, remove, or rename exported functions
