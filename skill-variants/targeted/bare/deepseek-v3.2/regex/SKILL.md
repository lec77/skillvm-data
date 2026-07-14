---
name: regex-patterns
description: Regex patterns for parsing logs, extracting data, and code search-and-replace in JavaScript/TypeScript.
---

# Regex Patterns

## Log Parsing

Parse structured log lines with capture groups. Handle edge cases: query strings in URLs, escaped quotes in messages, special characters.

```javascript
// Parse log: "2026-01-15 08:23:41 INFO 192.168.1.100 GET /api/users?q=x 200 45ms"
// Optional quoted message: "error text" (may contain escaped quotes like \"inner\")
const logRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\d+\.\d+\.\d+\.\d+) (\w+) (\S+?) (\d+) (\d+)ms(?: "((?:[^"\\]|\\.)*)")?$/;

// Strip query string from path: split on '?' and take first part
const path = rawPath.split('?')[0];

// Parse numbers: parseInt for status/duration, not string
const status = parseInt(match[6]);
const duration_ms = parseInt(match[7]);

// Escaped quotes in message: replace \" with "
const message = rawMsg.replace(/\\"/g, '"');
```

**Key patterns for log fields:**
- Timestamp: `\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}`
- IP: `\d+\.\d+\.\d+\.\d+`
- Path without query: capture `(\S+?)` before space, then strip `?...`
- Optional quoted message: `(?: "(...)")?$` — use `(?:[^"\\]|\\.)*` to handle escaped quotes

## Code Search-and-Replace

When cleaning up TypeScript/JavaScript code with regex replacements:

```javascript
// Remove lines matching a pattern
const lines = code.split('\n').filter(line => !line.match(/console\.log.*DEBUG/));

// Replace var with let/const
// IMPORTANT: Only use const for variables EXPLICITLY named in the requirements.
// If the prompt says "use const for 'result' and 'fullName'", use const ONLY for those two.
// All other var declarations become let, even if they appear to be never reassigned.
code = code.replace(/\bvar\s+(result|fullName)\b/, 'const $1');
code = code.replace(/\bvar\b/g, 'let');  // remaining vars become let

// Fix equality operators
code = code.replace(/([^!=])={2}([^=])/g, '$1===$2');  // == to ===
code = code.replace(/!={1}([^=])/g, '!==$1');           // != to !==

// Fix double spaces in string literals
code = code.replace(/"  "/g, '" "');
```

## Quick Reference

| Pattern | Matches |
|---|---|
| `\d` | Digit [0-9] |
| `\w` | Word char [a-zA-Z0-9_] |
| `\s` | Whitespace |
| `\b` | Word boundary |
| `.` | Any char (not newline) |
| `*` / `+` / `?` | 0+, 1+, 0-1 (greedy) |
| `*?` / `+?` | Lazy versions |
| `(?:...)` | Non-capturing group |
| `(?=...)` / `(?!...)` | Lookahead / negative lookahead |
| `(?<=...)` / `(?<!...)` | Lookbehind / negative lookbehind |

## JavaScript Regex API

```javascript
// Test: regex.test(str) → boolean
// Match: str.match(regex) → array or null
// matchAll: [...str.matchAll(/pattern/g)] → all matches with groups
// Replace: str.replace(regex, replacement)
// Split: str.split(regex)

// Always use 'g' flag for global match/replace
// Use 's' flag (dotAll) for . to match newlines
// Use 'm' flag for ^ $ to match line boundaries
```

## Common Gotchas

- Greedy `.*` matches as much as possible. Use `.*?` for lazy (shortest) match.
- In character classes `[]`, only `] - ^ \` need escaping.
- `\b` doesn't consume characters — it's a zero-width assertion.
- Always escape literal dots: `\.` not `.`
