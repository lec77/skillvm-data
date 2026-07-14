---
name: regex-patterns
description: Practical regex patterns for validation, parsing, extraction, and code refactoring. Use when working with regex in JavaScript, Python, or shell.
---

# Regex Patterns

## Core Syntax

| Pattern | Matches |
|---|---|
| `.` | Any char (not newline) |
| `\d` `\w` `\s` | Digit, word char, whitespace |
| `\D` `\W` `\S` | Negated versions |
| `\b` | Word boundary |
| `^` `$` | Start/end of line |
| `*` `+` `?` | 0+, 1+, 0-1 (greedy) |
| `*?` `+?` | Lazy versions |
| `{n}` `{n,m}` | Exact/range quantifiers |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `(?<name>...)` | Named group (JS) |
| `[abc]` `[^abc]` | Char class / negated |
| `a|b` | Alternation |

## Log Line Parsing

Server logs typically follow: `TIMESTAMP LEVEL IP METHOD PATH STATUS DURATIONms "optional message"`

**Pattern to parse log lines:**
```
^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\d+\.\d+\.\d+\.\d+) (\w+) (\S+) (\d+) (\d+)ms(?:\s+"(.*)")?$
```

Groups: timestamp, level, ip, method, full_path, status, duration_ms, message

**Important: Strip query strings from paths.** After extracting the path, split on `?` and take the first part:
```javascript
const path = fullPath.split('?')[0];
```

**Handle escaped quotes in messages.** Log messages may contain `\"` inside quoted strings. Use `(.*)` inside the quotes to capture the full message including escaped quotes, then the message value keeps the backslash-quote sequences as-is.

**Type conversions:** status and duration_ms must be numbers (use `parseInt()`). The message field should only exist on ERROR entries — omit it for INFO/WARN.

## Code Search-and-Replace

### Removing lines matching a pattern
```javascript
// Remove lines containing a pattern
const lines = code.split('\n').filter(line => !line.includes('pattern'));
```

### var → let/const replacement
When replacing `var` with `let` or `const`:
- Use `const` **only** for variables that are clearly never reassigned AND the task explicitly names them as const candidates (e.g., arrays initialized with `[]` that only use `.push()`, or string concatenation results stored once)
- Use `let` as the **default** replacement for `var` — use it for counters, loop variables, boolean flags, and any variable where reassignment status is ambiguous
- When in doubt, prefer `let` over `const`

### Equality operator fixes
Replace `==` with `===` and `!=` with `!==`:
```javascript
code = code.replace(/([^!=])={2}([^=])/g, '$1===$2');
code = code.replace(/!={1}([^=])/g, '!==$1');
```

### Fix double spaces in string literals
```javascript
code = code.replace(/"  "/g, '" "');
```

## Validation Patterns

```
# Email
^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$

# URL
https?://[^\s/]+(/[^\s?]*)?(\\?[^\s#]*)?(#[^\s]*)?

# IPv4
\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b

# ISO date
\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])
```

## Data Extraction (grep)

```bash
# Extract emails
grep -oP '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' file.txt

# Extract URLs
grep -oP 'https?://[^\s<>"]+' file.html

# Extract numbers
grep -oP '-?\d+\.?\d*' data.txt
```

## Tips

- Use `g` flag in JS for global replace: `/pattern/g`
- Use `.split('?')[0]` to strip query strings from URLs/paths
- `parseInt()` or `Number()` to convert matched strings to numbers
- Process files line-by-line for structured text parsing
- For file transformations: read → process → write (don't use sed on complex multi-step edits)
