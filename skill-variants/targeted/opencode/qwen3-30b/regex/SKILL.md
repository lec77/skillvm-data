---
name: regex-patterns
description: Regex patterns for validation, parsing, extraction, and code refactoring. Use when validating input, parsing logs, extracting data, or doing search-and-replace in code.
---

# Regex Patterns

## Code Search-and-Replace Tasks

When asked to clean up or transform code files:

1. **Read the source file first** to understand its content
2. **Apply ALL transformations at once before writing.** Do not write partial results.
3. **Never include line numbers in output.** `1: code` → just `code`.
4. **Remove lines completely** when asked. "Remove console.log lines containing DEBUG" = delete those lines entirely. Also remove associated comments.
5. **var → const/let:** For each `var`, check if the variable is reassigned with `=` later in the same scope:
   - YES reassigned → `let` (e.g., `let count = 0` when `count = count + 1` appears later)
   - NO reassignment → `const` (e.g., `const result = []` even if `.push()` is called on it)
   - **For loops:** `for (var i = ...)` → `for (let i = ...)` — keep `let i` INSIDE the for parentheses
6. **After writing, read the output file** and verify each change was applied

### Example transformation

Before:
```
// TODO: remove debug
const DEBUG = true;
function foo() {
  console.log("DEBUG: start");
  var items = [];
  var count = 0;
  for (var i = 0; i < 10; i++) {
    if (x == 1) items.push(i);
    count = count + 1;
  }
  var name = "hello  world";
  return items;
}
```

After:
```
function foo() {
  const items = [];
  let count = 0;
  for (let i = 0; i < 10; i++) {
    if (x === 1) items.push(i);
    count = count + 1;
  }
  const name = "hello world";
  return items;
}
```

Changes: removed TODO+DEBUG lines, removed console.log DEBUG, `var items`→`const items` (never reassigned), `var count`→`let count` (reassigned), `for(var i`→`for(let i`, `==`→`===`, double space→single space, `var name`→`const name` (never reassigned).

## Quick Reference

### Metacharacters
| Pattern | Matches |
|---|---|
| `.` | Any char (not newline) |
| `\d` / `\D` | Digit / non-digit |
| `\w` / `\W` | Word char / non-word |
| `\s` / `\S` | Whitespace / non-whitespace |
| `\b` | Word boundary |
| `^` / `$` | Start / end of line |

### Quantifiers
| Pattern | Meaning |
|---|---|
| `*` / `+` / `?` | 0+, 1+, 0-1 (greedy) |
| `*?` / `+?` | Lazy versions |
| `{n}` / `{n,m}` | Exact / range |

### Groups
| Pattern | Meaning |
|---|---|
| `(abc)` | Capture group |
| `(?:abc)` | Non-capturing group |
| `(?<name>abc)` | Named group (JS) |
| `a\|b` | Alternation |
| `[abc]` / `[^abc]` | Character class / negated |

## Log Parsing

For structured log extraction:
1. Read each line, apply a regex to capture fields
2. Use named groups or positional groups
3. Convert numeric fields (status codes, durations) to numbers
4. Handle optional fields — only include them when present
5. Strip query strings from URL paths: split on `?` and take the first part

### Common log pattern
```
timestamp level ip method path status duration [optional "message"]
```

Regex approach:
```javascript
const regex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+?) (\d+) (\d+)ms(?:\s+"((?:[^"\\]|\\.)*)")?$/
```

- Group 1: timestamp
- Group 2: level
- Group 3: ip
- Group 4: method
- Group 5: path (use `\S+?` with lazy match, then strip query string)
- Group 6: status (convert to number)
- Group 7: duration_ms (convert to number)
- Group 8: message (optional, handles escaped quotes)

For the path, strip query strings: `path.split('?')[0]`

## Validation Patterns

```
Email:    ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$
URL:      https?://[^\s/]+(/[^\s?]*)?(\\?[^\s#]*)?(#[^\s]*)?
IPv4:     \b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b
ISO date: \d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])
UUID:     [0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}
```

## Tips

- `.` does NOT match newlines by default. Use `s` flag (JS) or `re.DOTALL` (Python) if needed.
- `^`/`$` match string boundaries by default. Use `m` flag for line boundaries.
- Escape special chars: `. * + ? ^ $ { } [ ] ( ) | \`
- Prefer `\S+?` (lazy) over `\S+` (greedy) when followed by a delimiter.
- Go's regexp uses RE2 — no lookahead/lookbehind.
