---
name: regex-patterns
description: Practical regex patterns across languages and use cases. Use when validating input (email, URL, IP), parsing log lines, extracting data from text, refactoring code with search-and-replace, or debugging why a regex doesn't match.
metadata: {"clawdbot":{"emoji":"🔤","requires":{"anyBins":["grep","python3","node"]},"os":["linux","darwin","win32"]}}
---

# Regex Patterns

Practical regular expression cookbook for validation, parsing, extraction, and code refactoring.

## Quick Reference

| Pattern | Matches |
|---|---|
| `.` | Any char (not newline) |
| `\d` / `\D` | Digit / non-digit |
| `\w` / `\W` | Word char / non-word |
| `\s` / `\S` | Whitespace / non-whitespace |
| `\b` | Word boundary |
| `^` / `$` | Start / end of line |
| `*`, `+`, `?` | 0+, 1+, 0-1 (greedy) |
| `*?`, `+?` | Lazy versions |
| `{n}`, `{n,m}` | Exactly n, n to m |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `(?<name>...)` | Named group (JS) |
| `(?P<name>...)` | Named group (Python) |
| `a\|b` | Alternation |
| `[abc]` / `[^abc]` | Char class / negated |
| `(?=...)` / `(?!...)` | Lookahead / negative |
| `(?<=...)` / `(?<!...)` | Lookbehind / negative |

## Log Parsing

Parse structured log lines by matching each field positionally:

```
# Typical log: TIMESTAMP LEVEL IP METHOD PATH STATUS DURATIONms "MESSAGE"
^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\d+\.\d+\.\d+\.\d+) (\w+) (\S+?) (\d+) (\d+)ms(?:\s+"(.*)")?$
```

Key techniques:
- Use `(\S+?)` with a following space/pattern to stop at boundaries
- Strip query strings from paths: match `(/[^?\s]+)` to get path before `?`
- For optional trailing fields (like error messages), use `(?:...)?`
- Convert numeric fields (status, duration) to numbers in output
- Handle escaped quotes in messages: match `"(.*)"` — most regex engines handle `\"` within

## Data Extraction (JavaScript)

```javascript
// Find all matches with capture groups
const matches = [...text.matchAll(/pattern/g)];

// Named groups
const m = line.match(/(?<field1>...)\s+(?<field2>...)/);
// m.groups.field1, m.groups.field2

// Replace with callback
text.replace(/pattern/g, (match, g1) => transform(g1));

// Split on regex
'a, b;  c'.split(/[,;]\s*/); // ['a', 'b', 'c']
```

## Search-and-Replace for Code Cleanup

When refactoring code with regex:

1. **Remove lines matching a pattern**: Filter out lines containing specific strings
2. **Replace keywords**: `\bvar\b` → `let` or `const` based on context
3. **Fix operators**: `==` → `===`, `!=` → `!==` (use word boundaries or context to avoid matching `===`)
4. **Fix whitespace in strings**: Target `"  "` (double space) → `" "` (single space)
5. **Remove specific declarations**: Match the whole line including any preceding comment

**Critical rule for `var` → `const`/`let` replacement**: When the task names specific variables for `const` (e.g., "use const for `result` and `fullName`"), apply `const` ONLY to those exact names. Every other `var` becomes `let`, even if the variable is never reassigned. Do not apply your own judgment about reassignment — follow the task's explicit list.

## Python

```python
import re
re.match(r'pattern', text)      # Anchored to start
re.search(r'pattern', text)     # First match anywhere
re.findall(r'pattern', text)    # All matches
re.sub(r'pattern', repl, text)  # Replace
re.compile(r'pattern')          # Compile for reuse
# Flags: re.IGNORECASE, re.MULTILINE, re.DOTALL, re.VERBOSE
```

## Command Line

```bash
grep -P '\d+' file.txt          # PCRE matching
grep -oP 'pattern' file.txt     # Extract matches only
grep -vP 'pattern' file.txt     # Invert match
sed 's/old/new/g' file.txt      # Replace all
sed -E 's/(group)/\1/g'         # Extended with groups
```

## Common Gotchas

- **Greedy vs lazy**: `<.*>` matches entire `<b>bold</b>`, use `<.*?>` for `<b>`
- **Escaping**: `. * + ? ^ $ { } [ ] ( ) | \` need escaping outside char classes
- **Newlines**: `.` doesn't match `\n` by default; use `s` flag (JS) or `re.DOTALL` (Python)
- **Multiline**: `^`/`$` match string boundaries by default; use `m` flag for line boundaries
- **Go RE2**: No lookahead/lookbehind support
