---
name: regex-patterns
description: Practical regex patterns for extraction, validation, and code refactoring. Use when parsing logs, extracting data, or doing search-and-replace in code.
---

# Regex Patterns

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
| `{n}` `{n,m}` | Exact/range repetition |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `(?P<name>...)` | Named group (Python) |
| `(?<name>...)` | Named group (JS) |
| `[abc]` `[^abc]` | Character class / negated |
| `a\|b` | Alternation |

## Data Extraction with Regex

### Parsing structured text (logs, CSV, etc.)

1. Read the input file
2. Build a regex with capture groups for each field
3. For each line, apply the regex and extract groups
4. Convert types (strings to numbers where needed)
5. Write structured output (JSON)

**Key patterns for log parsing:**
```
# Timestamp: \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}
# IP address: \d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}
# Log level: (INFO|ERROR|WARN|DEBUG)
# HTTP method: (GET|POST|PUT|DELETE|PATCH)
# URL path: /\S+ (strip query strings by splitting on ?)
# Status code: \d{3}
# Duration: (\d+)ms
# Quoted message: "([^"\\]*(?:\\.[^"\\]*)*)"
```

**Handling edge cases:**
- Query strings in URLs: split path on `?` and take the first part
- Escaped quotes in messages: use `[^"\\]*(?:\\.[^"\\]*)*` inside quotes
- Optional fields: make the group optional with `(?:...)?`
- Type conversion: always convert status codes and durations to numbers, not strings

### JavaScript extraction example
```javascript
const regex = /^(\S+ \S+) (\w+) (\S+) (\w+) (\S+) (\d+) (\d+)ms(?:\s+"((?:[^"\\]|\\.)*)")?$/;
const match = line.match(regex);
if (match) {
  const obj = {
    timestamp: match[1],
    level: match[2],
    ip: match[3],
    method: match[4],
    path: match[5].split('?')[0],  // strip query string
    status: Number(match[6]),       // convert to number
    duration_ms: Number(match[7]),  // convert to number
  };
  if (match[8]) obj.message = match[8].replace(/\\"/g, '"');
}
```

### Python extraction example
```python
import re, json
pattern = re.compile(
    r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+) (\d+) (\d+)ms(?:\s+"((?:[^"\\]|\\.)*)")?$'
)
results = []
for line in open('input.log'):
    m = pattern.match(line.strip())
    if m:
        entry = {
            'timestamp': m.group(1),
            'level': m.group(2),
            'ip': m.group(3),
            'method': m.group(4),
            'path': m.group(5).split('?')[0],
            'status': int(m.group(6)),
            'duration_ms': int(m.group(7)),
        }
        if m.group(8):
            entry['message'] = m.group(8).replace('\\"', '"')
        results.append(entry)
json.dump(results, open('output.json', 'w'), indent=2)
```

## Code Refactoring with Regex

### Search-and-replace strategy

When cleaning up code with regex-based transformations:

1. **Read the entire source file first** to understand the code
2. **Apply each transformation separately** — don't try to do everything in one regex
3. **Write the result** to the output file

### Common code cleanup patterns

**Remove debug artifacts (ALL of these must be removed):**
- Lines containing `console.log` AND `DEBUG` (debug log statements)
- The debug constant declaration (e.g., `const DEBUG = true;`)
- Any comment directly above the debug constant (e.g., `// TODO: remove this debug logging`)

```python
# Remove ALL debug-related lines: console.log+DEBUG, const DEBUG, and its comment
cleaned = []
for line in lines:
    stripped = line.strip()
    # Skip console.log lines with DEBUG
    if 'console.log' in line and 'DEBUG' in line:
        continue
    # Skip the DEBUG constant declaration
    if stripped.startswith('const DEBUG') or stripped.startswith('var DEBUG') or stripped.startswith('let DEBUG'):
        continue
    # Skip TODO comments about debug removal
    if stripped == '// TODO: remove this debug logging':
        continue
    cleaned.append(line)
```

**Replace var with let/const (JavaScript/TypeScript):**

For EACH `var` declaration, follow this algorithm:
1. Find the variable name (e.g., `var result = []` → variable name is `result`)
2. Search the ENTIRE function for any line where `result = ` appears (without `var`/`let`/`const` before it)
3. If you find `result = something` anywhere after the declaration → use `let`
4. If you do NOT find any reassignment → use `const`

IMPORTANT: These are NOT reassignments (use `const` for these):
- `result.push(item)` — this modifies the array, not the variable
- `result[0] = 5` — this modifies an element, not the variable
- `obj.prop = value` — this modifies a property, not the variable

These ARE reassignments (use `let` for these):
- `count = count + 1` — the variable itself is being reassigned
- `i++` or `i = i + 1` — the variable itself is being reassigned
- `valid = false` — the variable itself is being reassigned

Worked example:
```
var result = [];      // result.push() is NOT reassignment → const result = []
var count = 0;        // count = count + 1 IS reassignment → let count = 0
var i = 0;            // i++ IS reassignment → let i = 0
var fullName = x + y; // never reassigned → const fullName = x + y
```

When the task prompt specifically names variables that should use `const`, follow those instructions exactly.

**Fix equality operators:**
```javascript
// Replace == with === and != with !==
code = code.replace(/([^!=])={2}([^=])/g, '$1===$2')
code = code.replace(/!={1}([^=])/g, '!==$1')
```

**Fix whitespace in string literals:**
```javascript
// Replace double spaces inside quotes with single space
code = code.replace(/"  "/g, '" "')
```

## Important Rules

- Parse files line by line. Don't try to match across the entire file at once.
- Convert numeric fields explicitly: `int()` in Python, `Number()` in JavaScript. Status codes and durations must be numbers, not strings.
- For optional fields (like error messages), only include them in the output object when they actually exist. Do not include `undefined` or `null`.
- When stripping query strings from URLs, use `.split('?')[0]` — this is simpler and more reliable than regex.
- When removing debug code, remove ALL traces: the console.log lines, the constant declaration, AND any associated comments.
- When replacing `var` with `let`/`const`, check if the variable is reassigned anywhere in the function. If not reassigned → `const`. If reassigned → `let`. Calling `.push()` on an array is NOT reassignment.
