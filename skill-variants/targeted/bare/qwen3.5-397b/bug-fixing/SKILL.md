---
name: bug-fixing
description: Load before fixing any bug. Contains correct patterns for race conditions (mutex chaining) and binary search bounds.
---

# Bug Fixing

1. Read the buggy file completely
2. Identify the root cause before writing any fix
3. Write the corrected file with COMPLETE code (all exports, all functions)
4. Run tests to verify

## Race Condition Fix

When async functions read/write shared state concurrently, the bug is: multiple calls read the same value before any writes back.

**Boolean locks do NOT work** — checking and setting a boolean has the same race.

Use promise-chaining mutex — copy this pattern exactly:

```typescript
let balance = 100
let mutex: Promise<void> = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  let result = false
  mutex = mutex.then(async () => {
    const current = balance
    await new Promise((r) => setTimeout(r, 1))
    if (current >= amount) {
      balance = current - amount
      result = true
    }
  })
  await mutex
  return result
}

export function getBalance(): number {
  return balance
}

export function resetBalance(value: number = 100): void {
  balance = value
}
```

Rules:
- `mutex` must be `let`, not `const` (reassigned each call)
- `result` declared outside `.then()`, set inside
- `mutex = mutex.then(...)` chains calls sequentially
- Keep original async work inside the callback
- Copy `getBalance` and `resetBalance` unchanged

## Off-by-One Fix

For binary search: `arr.length` accesses beyond the array. Use `arr.length - 1`:

```typescript
export function binarySearch(arr: number[], target: number): number {
  let left = 0
  let right = arr.length - 1  // NOT arr.length
  while (left <= right) {
    const mid = Math.floor((left + right) / 2)
    if (arr[mid] === target) return mid
    if (arr[mid] < target) left = mid + 1
    else right = mid - 1
  }
  return -1
}
```
