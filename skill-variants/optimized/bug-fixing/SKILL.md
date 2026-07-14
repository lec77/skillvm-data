---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

# Systematic Debugging

IMPORTANT: Do NOT use the question tool. Do NOT ask the user anything. Act autonomously: read the code, fix the bug, write the corrected file.

## Step-by-step procedure

### Step 1: Read the buggy file
Use the read tool to see the code.

### Step 2: Identify the bug
The ONLY change needed is the bug fix. Common off-by-one bugs:
- `arr.length` should be `arr.length - 1` (array bounds)
- `<` should be `<=` or vice versa (loop condition)

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

**RULE 2 — MINIMAL CHANGE.** Change ONLY the buggy line. Keep the loop condition (`while (left <= right)`) the same unless it is the bug. Keep the return statement the same. Do not add new logic, new checks, or restructure the code. The fix should be a one-line change.

**RULE 3 — COMPLETE FILE.** Always write the complete file including the closing `}`. Do not truncate.

### Step 4: Verify
If test files exist, run them with `bun test` to confirm the fix works.

## Worked example

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

**Bug:** Line 3 uses `arr.length` but should use `arr.length - 1`. With `arr.length`, the search can access index `arr.length` which is out of bounds.

**Fixed file to write (no line numbers, only change line 3):**
```
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

Notice: the ONLY change is `arr.length` → `arr.length - 1`. Everything else stays identical.
