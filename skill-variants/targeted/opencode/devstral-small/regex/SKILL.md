---
name: regex-patterns
description: Regex patterns for parsing, extraction, and code cleanup in JavaScript/Node.js
---

# Regex Patterns

## Log Parsing (Node.js)

Parse structured log lines into JSON using regex capture groups:

```javascript
const fs = require('fs');
const lines = fs.readFileSync('input.log', 'utf8').trim().split('\n');
const results = [];
for (const line of lines) {
  const m = line.match(
    /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) (\w+) (\S+) (\w+) (\S+) (\d+) (\d+)ms(?: "(.*)")?$/
  );
  if (!m) continue;
  const path = m[5].split('?')[0];
  const entry = {
    timestamp: m[1], level: m[2], ip: m[3],
    method: m[4], path: path, status: Number(m[6]),
    duration_ms: Number(m[7])
  };
  if (m[2] === 'ERROR' && m[8] !== undefined) entry.message = m[8];
  results.push(entry);
}
fs.writeFileSync('output.json', JSON.stringify(results, null, 2));
```

IMPORTANT regex details for log parsing:
- The space before the optional `"message"` is critical: `(\d+)ms(?: "(.*)")?$`
- There MUST be a space between `ms` and the opening quote: `ms "message"` not `ms"message"`
- Use `(\S+)` (greedy) for path, then split on `?` to strip query strings
- Use `Number()` to convert status and duration to integers
- Only add `message` field when level is ERROR and a quoted message exists
- The `(.*)` inside quotes handles escaped quotes like `\"` correctly

## Code Cleanup with Regex Replace

Common search-and-replace operations on source code:

```javascript
let code = fs.readFileSync('input.ts', 'utf8');

// Remove lines containing a pattern (e.g., debug statements)
code = code.split('\n').filter(l => !l.match(/console\.log.*DEBUG/)).join('\n');

// Remove specific lines (constant declarations, comments)
code = code.replace(/^.*const DEBUG = true;.*\n/gm, '');
code = code.replace(/^.*\/\/.*TODO.*remove.*\n/gim, '');

// Replace var with let (default), then const only for arrays/objects
// Arrays like `result = []` get const (array itself not reassigned)
// String concatenation results like `fullName = a + b` get const
// Counters, loop vars, booleans stay let (count, i, valid)
code = code.replace(/\bvar\b/g, 'let');
code = code.replace(/\blet (result\s*=\s*\[)/, 'const $1');
code = code.replace(/\blet (fullName\s*=)/, 'const $1');

// Fix loose equality
code = code.replace(/([^!=!])={2}([^=])/g, '$1===$2');
code = code.replace(/!={1}([^=])/g, '!==$1');

// Fix double spaces in strings to single spaces
code = code.replace(/"([^"]*)\s{2,}([^"]*)"/g, '"$1 $2"');

fs.writeFileSync('output.ts', code);
```

## Essential Regex Syntax

| Pattern | Meaning |
|---|---|
| `\d` | Digit [0-9] |
| `\w` | Word char [a-zA-Z0-9_] |
| `\s` | Whitespace |
| `\S` | Non-whitespace |
| `+` / `*` | 1+ / 0+ (greedy) |
| `+?` / `*?` | Lazy versions |
| `(...)` | Capture group |
| `(?:...)` | Non-capturing group |
| `^` / `$` | Start/end of line (with `m` flag) |
| `\b` | Word boundary |

## Tips

- Always read the file first, then write a Node.js script to process it
- Use `split('\n')` for line-by-line processing
- Use `.match()` with capture groups to extract fields
- Convert numeric fields with `Number()` or `parseInt()`
- Write output with `JSON.stringify(data, null, 2)` for formatted JSON
- For code cleanup, process the file as a string with `.replace()` and `.filter()`
