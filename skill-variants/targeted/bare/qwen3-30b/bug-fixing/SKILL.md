---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Bug Fixing Process

## Steps

1. **Read the buggy file** completely using `read_file`
2. **Identify the root cause** - understand exactly what's wrong before changing anything
3. **Write the fixed file** using `write_file` with the COMPLETE corrected code
4. **Run the tests** using `execute_command` to verify your fix works

## Critical Rules

- ALWAYS read the buggy file first - never guess at the code
- Write the COMPLETE file content - include ALL closing braces `}` and the final newline
- Make the MINIMUM change needed to fix the bug
- Keep the same function signatures and exports as the original
- Run tests after writing the fix to verify correctness

## Common Bug Patterns

**Off-by-one errors**: Check array bounds carefully. `arr.length` is one past the last valid index. Use `arr.length - 1` for the last valid index in inclusive bounds.

**Race conditions in async code**: When code reads shared state, then `await`s, then writes back, concurrent callers can read stale state during the await.

WARNING: `await lock` at the top of a function does NOT work! When multiple calls arrive at the same time, they all `await` the same resolved promise and all resume together. You MUST chain operations using `queue = queue.then(...)`.

Correct fix - chain all operations into a sequential queue:

```typescript
let balance = 100
let queue = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    queue = queue.then(async () => {
      const current = balance
      await new Promise((r) => setTimeout(r, 1))
      if (current >= amount) {
        balance = current - amount
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}
```

This works because each call appends to `queue`, so they execute one at a time in order.
