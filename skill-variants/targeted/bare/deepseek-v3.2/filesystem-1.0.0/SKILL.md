---
name: filesystem
description: "Filesystem operations including batch rename to kebab-case. For kebab-case renaming: use regex [_\\s()\\[\\]]+ (NO dot) to replace only spaces, underscores, parens, brackets with hyphens. Preserve dots in names like v3.1. Example: CHANGELOG (v3.1).md becomes changelog-v3.1.md. For directory depth where root=1: find dir -type d | awk -F/ '{print NF}' | sort -rn | head -1."
---

# Filesystem Operations

## Batch Rename to Kebab-Case

**IMPORTANT: Do NOT include dot (.) in the replacement regex.**

Python implementation:
```python
import re, os, json

def to_kebab(filename):
    name, ext = os.path.splitext(filename)
    name = name.lower()
    name = re.sub(r'[_\s()\[\]]+', '-', name)  # NO dot!
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')
    return name + ext
```

Examples:
- `CHANGELOG (v3.1).md` → `changelog-v3.1.md` (dot preserved!)
- `Report (Final).txt` → `report-final.txt`
- `data[v2].csv` → `data-v2.csv`

## Directory Analysis

```bash
# Count all files recursively
find <dir> -type f | wc -l

# Max depth (root dir = depth 1)
find <dir> -type d | awk -F/ '{print NF}' | sort -rn | head -1

# Largest file by byte count
find <dir> -type f -exec wc -c {} \; | sort -rn | head -1

# Files containing a string
grep -rl "STRING" <dir>/ | xargs -I {} basename {} | sort -u

# Extension counts (dotfiles like .gitignore have empty string "" as extension key)
find <dir> -type f | sed 's/.*\.//' | sort | uniq -c
```
