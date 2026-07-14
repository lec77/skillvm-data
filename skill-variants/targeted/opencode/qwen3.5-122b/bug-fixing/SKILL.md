---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Bug Fixing

IMPORTANT: Do NOT use the question tool. Do NOT ask the user anything. Act autonomously: read the code, fix the bug, write the corrected file.

## Step-by-step procedure

### Step 1: Read the buggy file
Use the read tool to see the code.

### Step 2: Identify the bug
The ONLY change needed is the bug fix. Common bug patterns:

**Off-by-one errors:**
- `arr.length` should be `arr.length - 1` (array bounds)
- `<` should be `<=` or vice versa (loop condition)

**Race conditions:**
- When async code reads shared state, yields (await), then writes back, concurrent calls read stale values
- Fix by serializing access with a promise-based lock so only one operation runs at a time

### Step 3: Write the fixed file
CRITICAL RULES for writing files:

**RULE 1 — NO LINE NUMBERS.** The read tool displays code with line number prefixes like `1: code` or `10: code`. These prefixes are NOT part of the source code. When you write a file, write ONLY the raw source code without any line number prefixes. If your output starts with `1:` or any `N:` prefix, you are doing it wrong.

**WRONG** (has line numbers — will cause syntax errors):
```
1: export function foo() {
2:   return 42
3: }
```

**CORRECT** (raw source code only):
```
export function foo() {
  return 42
}
```

**RULE 2 — MINIMAL CHANGE.** Change ONLY the buggy line(s). Do not add new logic, new checks, or restructure the code. Keep everything else identical.

**RULE 3 — COMPLETE FILE.** Always write the complete file including all closing braces. Do not truncate.

### Step 4: Verify
If test files exist, run them with `bun test` to confirm the fix works.

## Example 1: Off-by-one bug

**Buggy code (as shown by read tool):**
```
1: export function binarySearch(arr: number[], target: number): number {
2:   let left = 0
3:   let right = arr.length
4:   while (left <= right) {
5:     const mid = Math.floor((left + right) / 2)
6:     if (arr[mid] === target) return mid
7:     if (arr[mid] < target) left = mid + 1
8:     else right = mid - 1
9:   }
10:   return -1
11: }
```

**Bug:** Line 3 uses `arr.length` but should use `arr.length - 1`. With `arr.length`, the search accesses index `arr.length` which is out of bounds.

**Fixed file to write (no line numbers, only change line 3):**
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

## Example 2: Race condition bug

**Buggy code:**
```
1: let balance = 100
2:
3: export async function withdraw(amount: number): Promise<boolean> {
4:   const current = balance
5:   await new Promise((r) => setTimeout(r, 1))
6:   if (current >= amount) {
7:     balance = current - amount
8:     return true
9:   }
10:   return false
11: }
```

**Bug:** Line 4 reads `balance` into `current`, then line 5 awaits. During the await, other calls also read the same `balance` value. Multiple calls all see sufficient balance and all subtract, causing overdraw.

**Fix:** Use a promise-based lock to serialize access so only one withdrawal runs at a time.

**Fixed file to write:**
```typescript
let balance = 100
let lock = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    lock = lock.then(async () => {
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

export function getBalance(): number {
  return balance
}

export function resetBalance(value: number = 100): void {
  balance = value
  lock = Promise.resolve()
}
```
