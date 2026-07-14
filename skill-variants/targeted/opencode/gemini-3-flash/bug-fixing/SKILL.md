---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Bug Fixing Guide

IMPORTANT: Do NOT ask the user questions. Act autonomously: read the buggy file, identify the bug, write the fixed file, then verify.

## Procedure

### Step 1: Read the buggy file
Use the read tool to see the full source code.

### Step 2: Identify the bug type

**Off-by-one / bounds errors:**
- `arr.length` should be `arr.length - 1` (array index bounds)
- `<` should be `<=` or vice versa (loop/comparison)
- Fence-post errors in iteration

**Race conditions in async code:**
- Reading shared state, then awaiting, then writing back creates a window where concurrent calls all read the same stale value
- Fix: use a queue/lock so only one operation runs at a time

### Step 3: Write the fixed file

**CRITICAL RULES:**

1. **Output filename:** Write to the filename specified in the task prompt, NOT the buggy filename. If prompted to write to `bsearch.ts`, do NOT write to `buggy-bsearch.ts`. If prompted to write to `race-fixed.ts`, do NOT write to `buggy-race.ts`.

2. **NO LINE NUMBERS.** The read tool shows `1: code`, `2: code` etc. Those prefixes are NOT source code. Write ONLY raw source code without any number prefixes.

3. **MINIMAL CHANGE for simple bugs.** For off-by-one bugs, change ONLY the buggy line. Keep everything else identical.

4. **COMPLETE FILE.** Always write the entire file including all exports, closing braces, and helper functions.

5. **PRESERVE EXPORTS.** If the buggy file exports functions like `getBalance` and `resetBalance`, your fixed file MUST export them too with identical signatures.

### Step 4: Verify
Run `bun test` to confirm all tests pass. If tests fail, read the error output and fix your code.

## Race Condition Fix Pattern

When you see async code that reads a shared variable, awaits something, then writes back — that is a race condition. The fix is to serialize access with a promise queue:

```typescript
let balance = 100
let pending = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    pending = pending.then(async () => {
      await new Promise((r) => setTimeout(r, 1))
      if (balance >= amount) {
        balance -= amount
        resolve(true)
      } else {
        resolve(false)
      }
    })
  })
}

export function getBalance(): number {
  return balance
}

export function resetBalance(value: number = 100): void {
  balance = value
  pending = Promise.resolve()
}
```

Key points of the fix:
- `pending` is a promise chain that serializes all withdrawals
- Each withdrawal waits for the previous one to complete before running
- The balance check and update happen atomically within the chain
- `resetBalance` must also reset the `pending` chain

## Off-by-One Fix Example

**Buggy code (as shown by read tool):**
```
1: export function binarySearch(arr: number[], target: number): number {
2:   let left = 0
3:   let right = arr.length
4:   while (left <= right) {
...
```

**Bug:** Line 3 uses `arr.length` but should use `arr.length - 1`. With `arr.length`, the search accesses an out-of-bounds index.

**Fixed file (no line numbers, only change line 3):**
```typescript
export function binarySearch(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}
```
