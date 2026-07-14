---
name: regex-patterns
description: Practical regex patterns for validation, parsing, extraction, and code refactoring. Use when working with regex in any language.
---

# Regex Patterns

Compact regex cookbook for JavaScript, Python, Go, and CLI tools.

## Quick Reference

| Pattern | Matches | | Pattern | Meaning |
|---|---|---|---|---|
| `.` | Any char (not newline) | | `*` / `+` / `?` | 0+, 1+, 0-1 (greedy) |
| `\d` `\w` `\s` | Digit, word char, space | | `*?` `+?` | Lazy versions |
| `\b` | Word boundary | | `{n}` `{n,m}` | Exact / range |
| `^` `$` | Line start/end | | `(x)` `(?:x)` | Capture / non-capture group |
| `[abc]` `[^abc]` | Char class / negated | | `(?<name>x)` | Named group (JS/Go) |
| `\D` `\W` `\S` | Negated shortcuts | | `(?P<name>x)` | Named group (Python) |

Lookahead/behind: `(?=x)` `(?!x)` `(?<=x)` `(?<!x)`

## Common Patterns

```
Email:    ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
URL:      https?://[^\s/]+(/[^\s?]*)?(\?[^\s#]*)?(#[^\s]*)?
IPv4:     \b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b
ISO date: \d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])
UUID:     [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
SemVer:   \bv?(\d+)\.(\d+)\.(\d+)(?:-([\w.]+))?(?:\+([\w.]+))?\b
```

## Log Parsing

Parse structured log lines by building a regex with named capture groups matching each field. Example for `IP METHOD /path STATUS DURATION`:

```javascript
// Match each field with named groups
const re = /(?<ip>\d+\.\d+\.\d+\.\d+)\s+(?<method>\w+)\s+(?<path>\S+)\s+(?<status>\d+)\s+(?<duration>\d+)/;
const m = line.match(re);
// m.groups.ip, m.groups.status (string — parseInt for number)
```

**Key log parsing tips:**
- Use `\S+` for non-whitespace fields, `\d+` for numeric fields
- Use `.*` or `"([^"]*)"` for quoted message fields
- Strip query strings from paths: `path.replace(/\?.*$/, '')`
- Convert numeric strings: `parseInt(status)`, `parseFloat(duration)`
- For optional trailing fields (like error messages), use `(?:\s+"(.+)")?$`
- Handle escaped quotes in messages: `"((?:[^"\\]|\\.)*)"`

## Code Search-and-Replace

### Variable Declaration Cleanup (var → let/const)

**CRITICAL RULE — read carefully before writing any code:**

In JavaScript/TypeScript, `const` does NOT mean immutable. `const` means the binding cannot be reassigned. You CAN `.push()` to a `const` array. You CAN set properties on a `const` object. Therefore:

- `const arr = []` is CORRECT if `arr` is never reassigned (even if you call `arr.push(x)`)
- `let arr = []` is WRONG if `arr` is never reassigned — use `const`
- `let x = 0` is CORRECT if `x` is later reassigned (`x = x + 1`)

**When the task says "use const for X", you MUST write `const X` in your output code. Ignore source comments like "should be let or const" — follow the task prompt.**

```javascript
// Example: task says "use const for 'result' and 'fullName'"
// INPUT                      OUTPUT
// var result = [];         → const result = [];   ← MUST be const (task says so)
// var fullName = x + y;    → const fullName = x + y; ← MUST be const (task says so)
// var count = 0;           → let count = 0;       ← let (reassigned later)
// for (var i = 0; ...)     → for (let i = 0; ...) ← let (loop variable)
// var valid = expr;        → let valid = expr;    ← let (not named for const)
```

### Debug Line Removal

```javascript
// Remove lines containing console.log with 'DEBUG'
text.replace(/^.*console\.log\(.*DEBUG.*\);\n?/gm, '')
// Remove constant and its comment
text.replace(/^\/\/.*\n.*const DEBUG.*;\n/m, '')
```

### Equality Operators

```javascript
// Replace == with === and != with !==
// Use word boundary or context to avoid replacing === with ====
text.replace(/([^!=])={2}(?!=)/g, '$1===')
text.replace(/!={1}(?!=)/g, '!==')
```

### Whitespace in Strings

```javascript
// Fix double spaces inside string literals
// Match content between quotes, replace double spaces
line.replace(/"([^"]*)"/g, (m, content) => `"${content.replace(/  /g, ' ')}"`)
```

## Language Usage

### JavaScript
```javascript
regex.test(str)                    // boolean match
str.match(regex)                   // first match or null
[...str.matchAll(/pat/g)]          // all matches (needs g flag)
str.replace(/pat/g, 'new')        // replace all
str.replace(/pat/g, (m) => ...)   // replace with function
str.split(/[,;]\s*/)              // split on pattern
```

### Python
```python
import re
re.match(r'pat', s)        # anchored to start
re.search(r'pat', s)       # first match anywhere
re.findall(r'pat', s)      # all matches
re.sub(r'pat', 'new', s)   # replace
re.compile(r'pat')          # precompile for reuse
# Flags: re.MULTILINE, re.DOTALL, re.VERBOSE
```

### CLI
```bash
grep -P '\d+' file          # PCRE match
grep -oP '\d+' file         # extract matches only
grep -vP 'DEBUG' file       # invert match
sed 's/old/new/g' file      # replace
sed -E 's/(group)/\1/' file # extended regex
```

## Gotchas

- **Greedy vs lazy**: `<.*>` matches `<b>bold</b>` entirely; use `<.*?>` for `<b>` only
- **Escaping**: `. * + ? ^ $ { } [ ] ( ) | \` need `\` prefix outside char classes
- **Newlines**: `.` doesn't match `\n` by default — use `s` flag (JS) or `re.DOTALL` (Python)
- **`^`/`$`**: Match string boundaries by default; use `m` flag for line boundaries
- **Go RE2**: No lookahead/lookbehind — use `regexp2` package if needed
- **Global replace**: In JS, `/g` flag required for `replace` to affect all matches
