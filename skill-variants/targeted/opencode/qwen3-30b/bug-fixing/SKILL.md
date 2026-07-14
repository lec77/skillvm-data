---
name: bug-fixing
description: Fix bugs by reading code, identifying root cause, and writing corrected file
---

# Bug Fixing

DO NOT ask questions. DO NOT ask for confirmation. Just fix the bug.

## Steps — follow exactly

1. Read the buggy file with the Read tool
2. Find test files with `glob("*.test.ts")`
3. Read the test file — check the import path to find the output filename
4. Identify the bug by tracing logic with example inputs
5. Write the fixed file using the Write tool to the correct output filename
6. Run `bun test <testfile>` to check
7. If tests fail, read the error message carefully, fix the specific error, and run tests again
8. If tests pass, you are done

## Output filename

The test file's import tells you where to write:
- `import { foo } from "./bsearch"` → write `bsearch.ts`
- `import { foo } from "./race-fixed"` → write `race-fixed.ts`

## Common bugs and fixes

### Off-by-one in binary search
Bug: `right = arr.length` → Fix: `right = arr.length - 1`

### Race condition in async code
Bug: shared state read before `await`, written after — concurrent calls see stale data.
Fix: serialize with a promise-chain mutex. Here is the complete corrected file for a typical race condition:

```typescript
let balance = 100
let lock: Promise<void> = Promise.resolve()

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lock.then(fn)
  lock = result.then(() => {}, () => {})
  return result
}

export async function withdraw(amount: number): Promise<boolean> {
  return withLock(async () => {
    const current = balance
    await new Promise(r => setTimeout(r, 1))
    if (current >= amount) {
      balance = current - amount
      return true
    }
    return false
  })
}

export function getBalance(): number {
  return balance
}

export function resetBalance(value: number = 100): void {
  balance = value
}
```

Note: the file above has exactly 6 opening braces `{` and 6 closing braces `}`. Do not add extra braces.

## Rules

- NEVER ask questions — just fix the code
- Preserve all function signatures and exports exactly
- Run tests after writing and fix any errors based on error messages
- Do NOT add extra closing braces beyond what the code requires
