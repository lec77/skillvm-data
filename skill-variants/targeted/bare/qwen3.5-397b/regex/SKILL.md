---
name: regex-patterns
description: Practical regex patterns across languages and use cases. Use when validating input (email, URL, IP), parsing log lines, extracting data from text, refactoring code with search-and-replace, or debugging why a regex doesn't match.
---

# Regex Patterns

Practical regex cookbook for validation, parsing, extraction, and refactoring in JavaScript, Python, and CLI tools.

## Critical Rules

- **Follow task instructions literally and restrictively.** When replacing `var`: if the task names specific variables for `const` (e.g., "use const for 'result' and 'fullName'"), apply `const` to EXACTLY those named variables and `let` to ALL others — even if other variables are also never reassigned. The task's explicit list is exhaustive; do not add to it.
- When extracting data, output field types must match exactly: numbers as numbers (use parseInt/Number), not strings.
- When stripping query strings from paths, split on `?` and take only the first part.
- When a task says a field should "only exist" on certain entries, omit it entirely from other entries (don't include as null/undefined).
- Always write output files. After processing, write results to the specified output file.

## Quick Reference

### Metacharacters
| Pattern | Matches |
|---|---|
| `.` | Any char (except newline) |
| `\d` / `\D` | Digit / non-digit |
| `\w` / `\W` | Word char / non-word |
| `\s` / `\S` | Whitespace / non-whitespace |
| `\b` | Word boundary |
| `^` / `$` | Start / end of line |

### Quantifiers
| Pattern | Meaning |
|---|---|
| `*` / `+` / `?` | 0+, 1+, 0-1 (greedy) |
| `{n}` / `{n,m}` / `{n,}` | Exactly n, n-m, n+ |
| `*?` / `+?` | Lazy versions |

### Groups and Alternation
| Pattern | Meaning |
|---|---|
| `(abc)` | Capture group |
| `(?:abc)` | Non-capturing group |
| `(?<name>abc)` | Named group (JS) |
| `(?P<name>abc)` | Named group (Python) |
| `a|b` | Alternation |
| `[abc]` / `[^abc]` | Character class / negated |
| `[a-z]` | Range |

### Lookaround
| Pattern | Meaning |
|---|---|
| `(?=X)` / `(?!X)` | Positive/negative lookahead |
| `(?<=X)` / `(?<!X)` | Positive/negative lookbehind |

## Common Validation Patterns

```
Email:    ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
URL:      https?://[^\s/]+(/[^\s?]*)?(\?[^\s#]*)?(#[^\s]*)?
IPv4:     \b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b
ISO date: \d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])
UUID:     [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
SemVer:   \bv?(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?(?:\+([\w.]+))?\b
```

## Log Parsing

Parse structured log lines by matching fields positionally. Common log format:
```
timestamp level ip method path status duration [message]
```

### Regex for log parsing
```javascript
// Match: "2026-01-15 08:23:42 ERROR 10.0.0.55 POST /api/login 401 12ms "Invalid credentials""
const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+) (\d+) (\d+)ms(?:\s+"((?:[^"\\]|\\.)*)")?$/;
```

Key points:
- Capture timestamp as full string (date + time)
- Path may contain query string — strip with `path.split('?')[0]`
- Duration: extract number before `ms`, convert to number
- Status: convert to number with `parseInt()`
- Quoted message: use `"((?:[^"\\]|\\.)*)"` to handle escaped quotes like `\"`
- Only include message field in output when present

## JavaScript Usage

```javascript
// Test: /pattern/.test(str)
// Match: str.match(/pattern/)
// All matches: [...str.matchAll(/pattern/g)]
// Replace: str.replace(/pattern/g, replacement)
// Split: str.split(/pattern/)
// Named groups: str.match(/(?<name>\w+)/)?.groups?.name
```

## Data Extraction

```bash
# Extract emails: grep -oP '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' file
# Extract URLs: grep -oP 'https?://[^\s<>"]+' file
# Extract numbers: grep -oP '-?\d+\.?\d*' file
# Key-value pairs: grep -oP '\b(\w+)=([^\s&]+)' file
```

## Search-and-Replace in Code

When replacing `var` with `let`/`const`:
- ONLY use `const` for variables the task **explicitly names** as const candidates
- Use `let` for ALL other `var` declarations — even if the variable appears never reassigned. The task's named list is the complete list; do not expand it based on your own analysis.

Example: If the task says "use const for 'result' and 'fullName'", then:
- `var result = []` → `const result = []` ✓
- `var fullName = ...` → `const fullName = ...` ✓
- `var valid = ...` → `let valid = ...` ✓ (NOT const, because 'valid' was not named)
- `var count = 0` → `let count = 0` ✓
- `var i = 0` → `let i = 0` ✓
- Replace `==` with `===` and `!=` with `!==`
- Fix whitespace in string literals by replacing double spaces with single

```bash
# Rename variable: sed -i 's/\boldName\b/newName/g' file
# var→const: sed -i -E 's/\bvar\b/const/g' file
# Remove lines matching pattern: sed -i '/pattern/d' file
```

## Gotchas

- Greedy `.*` matches as much as possible; use `.*?` for lazy
- Escape special chars: `. * + ? ^ $ { } [ ] ( ) | \`
- `.` doesn't match newline by default (use `/s` flag in JS)
- `^`/`$` match string boundaries by default (use `/m` for line boundaries)
- Go RE2: no lookahead/lookbehind
- Always use `g` flag in JS for global replace/matchAll
