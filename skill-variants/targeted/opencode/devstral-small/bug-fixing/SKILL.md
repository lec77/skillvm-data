---
name: bug-fixing
description: Fix bugs in code by finding root cause first, then writing corrected implementation
---

# Bug Fixing

## Process

1. **Read the buggy file completely** — understand every line of logic
2. **Read the test file** — check the expected output filename from imports
3. **Find the root cause** — trace through code with example inputs to find the bug
4. **Write the fixed file** — use the correct output filename, preserve all exports and function signatures
5. **Run tests** — execute the test file to confirm all tests pass

## Common Bug Patterns

### Off-by-one errors
- Array bounds: use `length - 1` not `length` for last index
- Binary search: initialize `right = arr.length - 1`
- Loop conditions: check `<` vs `<=` carefully

### Race conditions (async/await)
- Bug: reading shared state before `await`, then writing after — other calls see stale value
- Fix: serialize access with a mutex/promise chain
- Pattern:
```typescript
let lock: Promise<void> = Promise.resolve()
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lock.then(fn)
  lock = result.then(() => {}, () => {})
  return result
}
```
- Wrap the entire read-check-write sequence inside `withLock`

### Logic errors
- Wrong operator (`&&` vs `||`, `<` vs `<=`)
- Wrong variable in expression
- Missing return statement

## Rules

- **Read first**: Always read the entire buggy file before fixing
- **Check test imports**: The test file's import path tells you the output filename
- **Preserve API**: Keep all function signatures, exports, and types identical
- **Single fix**: Fix the root cause only, don't refactor other code
- **Test after writing**: Run tests to confirm the fix works
