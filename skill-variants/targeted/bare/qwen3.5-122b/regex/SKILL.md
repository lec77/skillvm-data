---
name: regex-patterns
description: Practical regex patterns for validation, parsing, extraction, and search-and-replace. Use when working with regex in any language.
---

# Regex Patterns

Concise regex cookbook for validation, parsing, extraction, and refactoring.

## Core Syntax

| Pattern | Meaning |
|---|---|
| `.` | Any char (not newline) |
| `\d` `\w` `\s` | Digit, word char, whitespace |
| `\D` `\W` `\S` | Negated versions |
| `\b` | Word boundary |
| `^` `$` | Start/end of line |
| `*` `+` `?` | 0+, 1+, 0-1 (greedy) |
| `*?` `+?` | Lazy versions |
| `{n}` `{n,m}` | Exact/range quantifier |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `(?=...)` `(?!...)` | Lookahead (positive/negative) |
| `(?<=...)` `(?<!...)` | Lookbehind (positive/negative) |
| `[abc]` `[^abc]` | Char class / negated |
| `a|b` | Alternation |

## Common Validation Patterns

```
Email:    ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
URL:      https?://[^\s/]+(/[^\s?]*)?(\?[^\s#]*)?(#[^\s]*)?
IPv4:     \b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b
ISO date: \d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])
UUID:     [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
```

## Log Parsing

Parse structured log lines by matching fields positionally:
```
# Apache/Nginx: IP - - [date] "METHOD /path HTTP/x.x" status size
(\S+) - - \[([^\]]+)\] "(\w+) (\S+) \S+" (\d+) (\d+)

# Generic: timestamp level IP method path status duration ["message"]
# Use capture groups for each field. Strip query strings from paths with: path.split('?')[0]
# Handle optional quoted messages: (?:\s+"(.*)")?
# For escaped quotes inside messages, use: "([^"\\]*(?:\\.[^"\\]*)*)"
```

## Extraction (Python/JS)

```python
import re
re.findall(r'pattern', text)           # All matches
re.search(r'pattern', text).group()    # First match
re.sub(r'pattern', 'replacement', text) # Replace
```

```javascript
text.match(/pattern/g)                  // All matches
text.replace(/pattern/g, 'replacement') // Replace all
[...text.matchAll(/pattern/g)]          // Iterator with groups
```

## Search-and-Replace for Code Cleanup

When the task specifies which variables to use `const` vs `let` for, follow those instructions exactly — only use `const` for the specific variables mentioned, use `let` for all others.

Common code cleanup patterns:
```
Remove lines matching pattern: filter lines, skip matches
Replace var→let/const: replace only `var` keyword, choose let/const per task instructions
Fix loose equality: == → ===, != → !==
Fix whitespace in strings: "  " → " "
Remove debug lines: skip lines containing debug markers
```

## Key Gotchas

- `.*` is greedy — use `.*?` for lazy matching
- `.` doesn't match newlines by default (use `s`/`DOTALL` flag)
- `^`/`$` match string boundaries by default (use `m`/`MULTILINE` for line boundaries)
- Escape special chars: `. * + ? ^ $ { } [ ] ( ) | \`
- Go RE2: no lookahead/lookbehind
- Always use `g` flag in JS for global replace/matchAll
