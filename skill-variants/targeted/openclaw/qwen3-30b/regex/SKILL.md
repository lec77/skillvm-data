---
name: regex-patterns
description: Practical regex patterns for parsing, extraction, and code refactoring. Use when parsing logs, extracting data, or doing search-and-replace on code.
metadata: {"clawdbot":{"emoji":"🔤","requires":{"anyBins":["grep","python3","node"]},"os":["linux","darwin","win32"]}}
---

# Regex Patterns

## Critical Rules

1. **Always write scripts to a .py file first, then run them.** Never put Python code inline in a shell command — quoting will break.
2. **Parse ALL lines in the input.** If your script reports unmatched lines, fix the regex and re-run.
3. **After running, verify output counts match input.** If input has 20 lines, output must have 20 entries.
4. **"Remove a line" means DELETE it entirely**, not comment it out.

## Log Parsing Recipe (Python)

Write this to a `.py` file, then run it with `python3 parse.py`:

```python
import re, json

with open('server.log') as f:
    lines = f.readlines()

pattern = re.compile(
    r'^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})'  # timestamp
    r'\s+(\w+)'                                    # level
    r'\s+(\d+\.\d+\.\d+\.\d+)'                    # IP
    r'\s+(\w+)'                                    # HTTP method
    r'\s+(\S+)'                                    # path (may include query string)
    r'\s+(\d+)'                                    # status code
    r'\s+(\d+)ms'                                  # duration (number only)
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
        print(f"WARN: no match: {line}")
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
print(f'Extracted {len(records)} entries')
```

Key points for the regex:
- Use `\S+` for the path field — it matches any non-whitespace including `?`, `=`, `+`, `&`
- `(?:\s+"((?:[^"\\]|\\.)*)")?` makes the quoted message truly optional
- `(?:[^"\\]|\\.)*` handles escaped quotes like `\"` inside messages
- Strip query strings by splitting on `?` after matching

## Code Cleanup with Regex

When asked to clean up code, read the file, then write a Python script to transform it:

```python
import re

code = open('dirty-code.ts').read()
lines = code.split('\n')

# Step 1: DELETE lines (remove entirely, never comment out)
lines = [l for l in lines if not ('console.log' in l and 'DEBUG' in l)]
lines = [l for l in lines if 'const DEBUG = true' not in l]
lines = [l for l in lines if 'TODO: remove this debug' not in l]
code = '\n'.join(lines)

# Step 2: Replace EVERY var with let
code = re.sub(r'\bvar\b', 'let', code)

# Step 3: Change specific variables to const (the prompt tells you which)
code = re.sub(r'\blet (result)\b', r'const \1', code)
code = re.sub(r'\blet (fullName)\b', r'const \1', code)

# Step 4: Fix equality operators
code = re.sub(r'([^!=])={2}([^=])', r'\1===\2', code)
code = re.sub(r'!=([^=])', r'!==\1', code)

# Step 5: Fix double spaces in strings
code = code.replace('"  "', '" "')

open('cleaned-code.ts', 'w').write(code)
```

**IMPORTANT: You MUST replace every `var` with `let` or `const`.** Do not leave any `var` in the output. The prompt will specify which variables should be `const` — use `const` for those, `let` for all others.

## Quick Reference

| Pattern | Matches |
|---|---|
| `\S+` | Any non-whitespace (best for URLs/paths) |
| `\d` | Digit `[0-9]` |
| `\w` | Word char `[a-zA-Z0-9_]` |
| `\b` | Word boundary |
| `(?:...)?` | Optional non-capturing group |
| `(?:[^"\\]|\\.)*` | String content with escaped chars |
| `*?`, `+?` | Lazy (match as few as possible) |
