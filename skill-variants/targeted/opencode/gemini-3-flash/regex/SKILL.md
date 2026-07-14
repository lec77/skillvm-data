---
name: regex-patterns
description: Regex patterns for parsing, extraction, and search-and-replace. Use when parsing logs, extracting structured data, or refactoring code with regex.
---

# Regex Patterns

Practical regex cookbook for JavaScript/TypeScript and Python. Focus: log parsing, data extraction, code refactoring.

## Core Syntax

| Pattern | Meaning |
|---|---|
| `\d` | Digit `[0-9]` |
| `\w` | Word char `[a-zA-Z0-9_]` |
| `\s` | Whitespace |
| `\S` | Non-whitespace |
| `\b` | Word boundary |
| `.` | Any char (not newline) |
| `^` / `$` | Start / end of line |
| `*` / `+` / `?` | 0+, 1+, optional |
| `{n}` / `{n,m}` | Exact / range |
| `*?` / `+?` | Lazy versions |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `(?P<name>...)` | Named group (Python) |
| `(?<name>...)` | Named group (JS) |
| `[abc]` / `[^abc]` | Char class / negated |
| `a\|b` | Alternation |

## Log Parsing

Parse structured log lines with regex. Common format:
```
TIMESTAMP LEVEL IP METHOD PATH STATUS DURATIONms "optional message"
```

**Python regex for log parsing:**
```python
import re, json

pattern = re.compile(
    r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) '  # timestamp
    r'(\w+) '                                       # level
    r'(\d+\.\d+\.\d+\.\d+) '                       # ip
    r'(\w+) '                                        # method
    r'(\S+) '                                        # path (may have query string)
    r'(\d+) '                                        # status
    r'(\d+)ms'                                       # duration
    r'(?:\s"(.*)")?$'                                # optional message in quotes
)

# Strip query strings: path.split('?')[0]
# Convert status and duration to int
# Handle escaped quotes in messages: message.replace('\\"', '"')
# Only include message field for ERROR entries
```

**Key edge cases:**
- Paths with query strings (`/api/search?q=hello`) — extract path only (before `?`)
- Messages with escaped quotes (`"Connection to \"db-primary\" failed"`) — unescape `\"`
- Messages with special chars (`CN=*.example.com, serial=0x1A2B`) — regex `(.*)` handles these
- High duration values (1503ms, 5023ms) — just parse the number

## Code Refactoring with Regex

When doing search-and-replace on code:

**Follow the exact specification.** When the prompt lists specific variables for `const` (e.g., "use const for 'result' and 'fullName'"), apply `const` to only those named variables. Use `let` for all other `var` replacements.

### Common replacements:
- Remove specific lines: delete lines matching a pattern (e.g., `console.log` with `DEBUG`)
- Replace `var` with `let`/`const`: apply `const` only to variables the prompt explicitly names; use `let` for everything else
- Fix equality: replace `==` with `===`, `!=` with `!==`
- Fix whitespace in strings: replace `"  "` with `" "`
- Remove constant declarations and their comments

### JavaScript approach:
```javascript
// Read file, apply transformations, write result
const lines = fs.readFileSync('input.ts', 'utf-8').split('\n');
const cleaned = lines
  .filter(line => !shouldRemove(line))
  .map(line => applyReplacements(line))
  .join('\n');
fs.writeFileSync('output.ts', cleaned);
```

### sed approach:
```bash
# Chain multiple sed replacements
sed -e '/pattern_to_remove/d' \
    -e 's/\bvar\b/let/g' \
    -e 's/==/===/g' \
    input.ts > output.ts
```

## Data Extraction (JavaScript)

```javascript
// Extract with capture groups
const match = text.match(/(\d{4})-(\d{2})-(\d{2})/);

// Find all matches
const matches = [...text.matchAll(/pattern/g)];

// Replace with callback
text.replace(/\b\w/g, c => c.toUpperCase());

// Split with regex
'one, two;  three'.split(/[,;]\s*/);
```

## Tips

- Use `\S+` to match non-whitespace sequences in log lines
- `(.*)` at end of line captures everything including special chars
- `(?:...)` for optional groups you don't need to capture
- `split('?')[0]` is simpler than regex for stripping query strings
- Always convert extracted numbers with `int()` or `parseInt()`
- Test regex on actual data, especially edge cases with special characters
