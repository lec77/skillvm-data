---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Bug Fixing

IMPORTANT: Do NOT use the question tool. Do NOT ask the user anything. Act autonomously: read the code, fix the bug, write the corrected file.

## Step-by-step procedure

### Step 1: Read the buggy file
Use the read tool to see the code. Read the ENTIRE file.

### Step 2: Identify the bug
Look for these common bug patterns:

**Off-by-one errors:**
- `arr.length` should be `arr.length - 1` (upper bound is inclusive)
- `<` should be `<=` or vice versa

**Race conditions in async code:**
- Reading shared state, then awaiting, then writing based on the stale read
- Fix: use a mutex/lock so only one operation runs at a time

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

**RULE 2 — MINIMAL CHANGE.** Change ONLY what is needed to fix the bug. Do not restructure, rename, or add new logic.

**RULE 3 — COMPLETE FILE.** Always write the complete file. Do not truncate or omit parts.

**RULE 4 — OUTPUT FILENAME.** Write the fixed code to the filename the prompt tells you. Pay close attention to the exact output filename requested.

### Step 4: Verify
If test files exist, run them with `bun test` to confirm the fix works.

## Example A: Off-by-one fix

Buggy code uses `let right = arr.length`. Fix: `let right = arr.length - 1`. That is the ONLY change needed.

## Example B: Race condition fix

Buggy code reads `balance`, awaits, then uses the stale value. Fix: add a mutex so withdrawals execute one at a time.

```typescript
let balance = 100
let lock: Promise<void> = Promise.resolve()

export async function withdraw(amount: number): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    lock = lock.then(async () => {
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
  lock = Promise.resolve()
}
```

Key points about the race condition fix:
- The `lock` variable chains all operations sequentially
- Each withdrawal waits for the previous one to finish
- Balance check and update happen atomically (no await between them)
- `resetBalance` must also reset the lock
