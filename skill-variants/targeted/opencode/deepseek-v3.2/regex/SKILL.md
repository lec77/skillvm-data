---
name: regex-patterns
description: Practical regex patterns across languages and use cases. Use when validating input (email, URL, IP), parsing log lines, extracting data from text, refactoring code with search-and-replace, or debugging why a regex doesn't match.
---

# Regex Patterns

## Log Parsing

Extract structured data from log lines using regex capture groups.

```
# Typical log format: TIMESTAMP LEVEL IP METHOD PATH STATUS DURATIONms "optional message"
# Regex with named groups:
^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s+(INFO|ERROR|WARN|DEBUG)\s+(\S+)\s+(\w+)\s+(\S+)\s+(\d+)\s+(\d+)ms(?:\s+"((?:[^"\\]|\\.)*)")?$
```

Key parsing rules:
- Paths may have query strings (`/api/search?q=hello`). Extract path WITHOUT query: split on `?` and take first part
- Error messages in quotes may contain escaped quotes (`\"`) — handle with `(?:[^"\\]|\\.)*`
- `status` and `duration_ms` must be numbers, not strings
- Only include `message` field when it exists (ERROR entries)

### JavaScript log parsing example

```javascript
const lines = logText.split('\n').filter(l => l.trim());
const regex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s+(INFO|ERROR|WARN)\s+(\S+)\s+(\w+)\s+(\S+)\s+(\d+)\s+(\d+)ms(?:\s+"((?:[^"\\]|\\.)*)")?$/;
const results = lines.map(line => {
  const m = line.match(regex);
  if (!m) return null;
  const path = m[5].split('?')[0]; // strip query string
  const entry = {
    timestamp: m[1], level: m[2], ip: m[3],
    method: m[4], path, status: Number(m[6]), duration_ms: Number(m[7])
  };
  if (m[8]) entry.message = m[8].replace(/\\"/g, '"'); // unescape quotes
  return entry;
}).filter(Boolean);
```

## Code Search-and-Replace

### var → let/const

**RULE: Replace `var` with `let` by default. Only use `const` when the prompt explicitly names a variable as `const`-worthy.**

When the prompt says "use const for variables like X and Y", ONLY use `const` for exactly those named variables. Use `let` for everything else — even if the variable is technically never reassigned. Follow the prompt literally.

**Decision table:**
| Variable | Prompt says const? | Use |
|---|---|---|
| `var result = []` | Yes (explicitly named) | `const` |
| `var fullName = a + b` | Yes (explicitly named) | `const` |
| `var count = 0` | No | `let` |
| `for (var i = 0; ...)` | No | `let` |
| `var valid = expr` | No | `let` |

### Other common replacements

```javascript
// Loose → strict equality
str.replace(/([^!=])={2}([^=])/g, '$1===$2')  // == → ===
str.replace(/!={1}([^=])/g, '!==$1')           // != → !==

// Remove specific console.log lines (e.g. DEBUG logs)
lines.filter(l => !(l.includes('console.log') && l.includes('DEBUG')))

// Fix double spaces in string literals
str.replace(/"  "/g, '" "')
```

## Validation Patterns

```
# Email:  ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
# URL:    https?://[^\s/]+(/[^\s?]*)?(\?[^\s#]*)?(#[^\s]*)?
# IPv4:   \b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b
# UUID:   [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
# ISO date: \d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])
```

## Quick Reference

| Pattern | Matches |
|---|---|
| `.` | Any char (not newline) |
| `\d` `\w` `\s` | Digit, word char, whitespace |
| `\b` | Word boundary |
| `*` `+` `?` | 0+, 1+, 0-1 (greedy) |
| `*?` `+?` | Lazy versions |
| `{n}` `{n,m}` | Exact, range |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `(?=...)` `(?!...)` | Lookahead |
| `(?<=...)` `(?<!...)` | Lookbehind |
| `[abc]` `[^abc]` | Char class, negated |

## Tips

- Use `g` flag in JS for global replace/matchAll
- `grep -oP` extracts matching parts (PCRE)
- Always escape `.` `*` `+` `?` when matching literally
- `.*?` (lazy) stops at first match; `.*` (greedy) matches as much as possible
