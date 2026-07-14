---
name: regex-patterns
description: Practical regex patterns for parsing, extraction, and code refactoring. Use when parsing logs, extracting data, or doing search-and-replace on code.
metadata: {"clawdbot":{"emoji":"🔤","requires":{"anyBins":["grep","python3","node"]},"os":["linux","darwin","win32"]}}
---

# Regex Patterns

## Critical Rules

1. **Always write scripts to a .py file first, then run them.** Never inline Python in shell commands.
2. **Parse ALL lines.** If any lines are unmatched, fix the regex and re-run until every line is parsed.
3. **Verify output counts match input.** 20 input lines = 20 output entries.
4. **"Remove a line" means DELETE it entirely** — not comment it out, not replace with empty string.
5. **Numeric fields must be numbers**, not strings. Use `int()` after capturing.
6. **Strip query strings from URL paths** by splitting on `?` after matching.

## Log Parsing Recipe

For extracting structured data from server logs, write a Python script to a `.py` file:

```python
import re, json

with open('server.log') as f:
    lines = f.readlines()

pattern = re.compile(
    r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'  # timestamp
    r'\s+(\w+)'                                    # level (INFO/ERROR/WARN)
    r'\s+(\d+\.\d+\.\d+\.\d+)'                    # IP address
    r'\s+(\w+)'                                    # HTTP method
    r'\s+(\S+)'                                    # full path (may have query string)
    r'\s+(\d+)'                                    # status code
    r'\s+(\d+)ms'                                  # duration in ms
    r'(?:\s+"((?:[^"\\]|\\.)*)")?'                 # optional quoted message
    r'\s*$'
)

records = []
for line in lines:
    line = line.strip()
    if not line:
        continue
    m = pattern.match(line)
    if not m:
        print(f"UNMATCHED: {line}")
        continue
    timestamp, level, ip, method, full_path, status, duration, message = m.groups()
    path = full_path.split('?')[0]  # strip query string
    record = {
        'timestamp': timestamp, 'level': level, 'ip': ip,
        'method': method, 'path': path,
        'status': int(status), 'duration_ms': int(duration),
    }
    if level == 'ERROR' and message:
        record['message'] = message.replace('\\"', '"')
    records.append(record)

with open('extracted.json', 'w') as f:
    json.dump(records, f, indent=2)
print(f'Extracted {len(records)} records')
```

### Key regex details

- `\S+` for path captures everything including `?`, `=`, `&` — strip query string afterward with `.split('?')[0]`
- `(?:\s+"((?:[^"\\]|\\.)*)")?` makes the quoted message optional — the `?` at the end is critical
- `(?:[^"\\]|\\.)*` handles escaped quotes like `\"` inside messages
- `message.replace('\\"', '"')` unescapes the captured message
- Only add `message` field for ERROR entries
- `int(status)` and `int(duration)` ensure numeric types in JSON output

## Code Cleanup Recipe

For regex-based code transformations, write a Python script:

```python
import re

with open('dirty-code.ts') as f:
    code = f.read()
lines = code.split('\n')

# Step 1: DELETE lines containing specific patterns (remove entirely)
lines = [l for l in lines if not ('console.log' in l and 'DEBUG' in l)]
lines = [l for l in lines if 'const DEBUG = true' not in l]
lines = [l for l in lines if 'TODO: remove this debug' not in l]
code = '\n'.join(lines)

# Step 2: Replace ALL var with let first
code = re.sub(r'\bvar\b', 'let', code)

# Step 3: Upgrade specific variables to const (ones that are never reassigned)
code = re.sub(r'\blet (result)\b', r'const \1', code)
code = re.sub(r'\blet (fullName)\b', r'const \1', code)

# Step 4: Fix equality operators (== to ===, != to !==)
code = re.sub(r'([^!=])={2}([^=])', r'\1===\2', code)
code = re.sub(r'!=([^=])', r'!==\1', code)

# Step 5: Fix double spaces inside string literals
code = code.replace('"  "', '" "')

with open('cleaned-code.ts', 'w') as f:
    f.write(code)
print('Cleaned code written')
```

### Key points

- **Order matters**: replace all `var` with `let` first, THEN upgrade specific ones to `const`
- The prompt tells you which variables should be `const` — only those, all others become `let`
- `([^!=])={2}([^=])` avoids matching `===` or `!==` that already exist
- For double spaces in strings: simple string replace of `"  "` with `" "` works

## Quick Reference

| Pattern | Matches |
|---|---|
| `\S+` | Any non-whitespace (URLs, paths) |
| `\d` | Digit `[0-9]` |
| `\w` | Word char `[a-zA-Z0-9_]` |
| `\b` | Word boundary |
| `(?:...)?` | Optional non-capturing group |
| `(?:[^"\\]|\\.)*` | String content with escaped chars |
| `*?`, `+?` | Lazy (match as few as possible) |
