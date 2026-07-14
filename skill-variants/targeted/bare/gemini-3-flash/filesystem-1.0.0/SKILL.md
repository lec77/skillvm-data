---
name: filesystem
description: "CRITICAL: Load this skill before any filesystem task. Contains essential batch rename logic, kebab-case conversion rules (MUST preserve dots like v3.1), directory analysis patterns, and JSON output templates. Without this skill, common edge cases will be handled incorrectly."
---

# Filesystem Operations

## IMPORTANT: Kebab-Case Rename Rules

When renaming files to kebab-case, you MUST:
1. Lowercase all letters
2. Replace spaces, underscores, parentheses `()`, brackets `[]`, and special chars with hyphens
3. **PRESERVE dots within the filename** — dots are NOT special characters. "v3.1" stays "v3.1", NOT "v3-1"
4. Collapse consecutive hyphens to single hyphen
5. Remove leading/trailing hyphens (keep extension)

Correct examples:
- "CHANGELOG (v3.1).md" → "changelog-v3.1.md" ✓ (dot preserved!)
- "Report (Final).txt" → "report-final.txt"
- "data[v2].csv" → "data-v2.csv"
- "test_RESULTS_Final (1).json" → "test-results-final-1.json"
- "Budget   Forecast[2026].xlsx" → "budget-forecast-2026.xlsx"

**WRONG**: "changelog-v3-1.md" ✗ (dot was incorrectly replaced)

Use this regex to replace special chars (note the `.` is EXCLUDED from replacement):
```python
import os, re, json

def to_kebab(filename):
    name, ext = os.path.splitext(filename)
    name = name.lower()
    name = re.sub(r'[^a-z0-9.]+', '-', name)  # keep dots!
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')
    return name + ext

directory = 'messy_files'
log = {}
for f in sorted(os.listdir(directory)):
    new = to_kebab(f)
    if f != new:
        os.rename(os.path.join(directory, f), os.path.join(directory, new))
    log[f] = new
with open('rename_log.json', 'w') as fh:
    json.dump(log, fh, indent=2)
```

## Directory Analysis

```bash
find . -type f | wc -l                                        # total files
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn   # by extension
find . -type f -exec ls -l {} \; | sort -k5 -rn | head -1     # largest file
grep -rl "pattern" .                                           # files with content
find . -type d | awk -F/ '{print NF-1}' | sort -rn | head -1  # max depth
```

## JSON Output

Write JSON results with python or heredoc:
```bash
python3 -c "import json; json.dump({'key': 'val'}, open('out.json','w'), indent=2)"
```
