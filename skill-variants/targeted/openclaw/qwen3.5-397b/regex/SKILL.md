---
name: regex-patterns
description: Practical regex patterns for parsing, extraction, and code refactoring. Use when parsing logs, extracting data, or doing search-and-replace on code.
metadata: {"clawdbot":{"emoji":"🔤","requires":{"anyBins":["grep","python3","node"]},"os":["linux","darwin","win32"]}}
---

# Regex Patterns

## Critical Rules

1. **Write scripts to a file first, then run them.** Never inline Python code in a shell command.
2. **Parse ALL lines in the input.** If any lines go unmatched, fix the regex and re-run.
3. **Verify output counts match input.** If input has N lines, output must have N entries.
4. **"Remove a line" means DELETE it entirely** — not comment it out or leave it blank.
5. **When replacing `var` with `let`/`const`**: only use `const` for the specific variable names the prompt explicitly tells you. Every other `var` becomes `let`. Do NOT decide `const` vs `let` on your own — follow the prompt literally. Note: arrays that are `.push()`'d into are still `const` — mutation is not reassignment.

## Log Parsing Recipe (Python)

Write to a `.py` file, then run with `python3`:

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

Key points:
- `\S+` for path — matches any non-whitespace including `?`, `=`, `+`, `&`
- `(?:\s+"((?:[^"\\]|\\.)*)")?` — optional quoted message, handles escaped quotes
- Strip query strings by splitting on `?` after matching
- `message` field only on ERROR entries
- Cast `status` and `duration` to `int`

## Code Cleanup Recipe (Python)

When cleaning up code with regex, write a Python script:

```python
import re

code = open('dirty-code.ts').read()
lines = code.split('\n')

# Step 1: DELETE lines (remove entirely, never comment out)
lines = [l for l in lines if not ('console.log' in l and 'DEBUG' in l)]
lines = [l for l in lines if 'const DEBUG = true' not in l]
lines = [l for l in lines if 'TODO: remove this debug' not in l]
code = '\n'.join(lines)

# Step 2: Replace EVERY var → let first
code = re.sub(r'\bvar\b', 'let', code)

# Step 3: ONLY change the specific variables the prompt names for const
# Example: if prompt says "use const for result and fullName":
code = re.sub(r'\blet (result)\b', r'const \1', code)
code = re.sub(r'\blet (fullName)\b', r'const \1', code)
# Do NOT change any other let to const — even if the variable looks like
# it could be const. Only the explicitly named ones.

# Step 4: Fix equality operators
code = re.sub(r'([^!=])={2}([^=])', r'\1===\2', code)
code = re.sub(r'!=([^=])', r'!==\1', code)

# Step 5: Fix double spaces in string literals
code = code.replace('"  "', '" "')

open('cleaned-code.ts', 'w').write(code)
```

**CRITICAL**: The prompt will say something like "use const for variables that are never reassigned like 'result' and 'fullName'". This means ONLY `result` and `fullName` become `const`. All other variables (`count`, `i`, `valid`, etc.) must be `let`. Do not use your own judgment about reassignment — follow the prompt's explicit list. Remember: `const arr = []` then `arr.push(x)` is valid — `.push()` mutates the array but doesn't reassign the variable, so `const` is correct.

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
