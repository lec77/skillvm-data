---
name: bug-fixing
description: Fix bugs in code by finding root cause first, then writing corrected implementation
---

# Bug Fixing

## Process

1. **Read the buggy code completely** — every line, understand the full logic
2. **Identify the root cause** — trace through the code mentally with example inputs
3. **Write the corrected file** — preserve all exports, types, and function signatures
4. **Run tests to verify** — ensure all tests pass

## Common Bug Patterns

### Off-by-one errors
- Array bounds: `length` vs `length - 1`
- Loop conditions: `<` vs `<=`, `>` vs `>=`
- Binary search: `right = arr.length - 1` (not `arr.length`)
- Fence-post: iterating one too many or too few times

### Race conditions
- Shared mutable state accessed across `await` boundaries
- Read-then-write without atomicity — another call reads stale value between read and write
- **Fix**: Use a mutex/lock to serialize access to shared state
- Simple JS mutex pattern:
```typescript
let lock: Promise<void> = Promise.resolve()
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const result = lock.then(fn)
  lock = result.then(() => {}, () => {})
  return result
}
```

### Null/undefined access
- Optional chaining missing on nullable values
- Accessing properties before null check

### Logic errors
- Wrong operator (`&&` vs `||`, `===` vs `!==`)
- Wrong variable used in expression
- Missing return statement

## Rules

- **Read first**: Always read the entire buggy file before proposing any fix
- **Preserve API**: Keep all function signatures, exports, and types identical
- **Single fix**: Address the root cause, don't refactor unrelated code
- **Write to correct filename**: Check the test file imports to know the expected output filename
- **Test after writing**: Run the test file to confirm the fix works
