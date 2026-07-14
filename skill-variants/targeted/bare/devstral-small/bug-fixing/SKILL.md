---
name: bug-fixing
description: MUST load before fixing ANY bug. Contains the ONLY correct mutex pattern for race conditions (boolean locks DO NOT work) and correct binary search bounds. Without this skill you WILL write broken code.
---

# Bug Fixing Guide

Read the buggy code. Identify the bug type. Apply the matching fix pattern below.

## Race Condition Fix

If the bug involves concurrent async functions reading/writing shared state:

The problem is always: multiple calls read the same value before any call writes back.

**A boolean lock does NOT work** — checking and setting a boolean has the same race.

**Use this exact mutex pattern — copy it exactly:**

```typescript
let balance = 100
let mutex: Promise<void> = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  let result = false
  // Chain onto mutex so calls execute one at a time
  mutex = mutex.then(async () => {
    const current = balance
    await new Promise((r) => setTimeout(r, 1)) // keep original async work
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

CRITICAL rules for this pattern:
- `mutex` MUST be declared with `let`, not `const` (it gets reassigned each call)
- `result` is declared OUTSIDE `.then()` and set INSIDE it
- `mutex = mutex.then(...)` chains each call sequentially
- `await mutex` waits for the current call's turn to finish
- Keep the original async work (setTimeout) inside the `.then()` callback
- Copy `getBalance` and `resetBalance` unchanged

## Off-by-One Fix

If the bug involves array indexing or loop bounds:

Common mistakes:
- `arr.length` instead of `arr.length - 1` for the last valid index
- `<=` instead of `<` in loop conditions (or vice versa)

**Binary search — correct version:**
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
