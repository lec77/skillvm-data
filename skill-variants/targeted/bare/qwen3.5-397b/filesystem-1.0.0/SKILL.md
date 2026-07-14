---
name: filesystem
description: Filesystem operations - directory listing, file search, batch processing, directory analysis. Use for listing contents, searching by name/content, analyzing directory structures, batch rename/copy/move/delete, size analysis.
---

# Filesystem Operations

## Batch Rename (kebab-case)

**CRITICAL RULES for kebab-case renaming:**
- Use `os.path.splitext()` to separate name from extension
- Lowercase the base name
- Use EXACTLY this regex to replace special chars: `re.sub(r'[\s_\(\)\[\]]+', '-', base)`
- This regex ONLY replaces: whitespace, underscores, parentheses, brackets
- **DO NOT use `[^a-z0-9]` — this incorrectly removes dots/periods**
- Dots inside filenames like `v3.1` MUST be preserved as `v3.1` (NOT `v3-1`)
- Then collapse consecutive hyphens: `re.sub(r'-{2,}', '-', base)`
- Then strip leading/trailing hyphens: `base.strip('-')`

**Use this exact function:**
```python
import os, re, json

def to_kebab(filename):
    base, ext = os.path.splitext(filename)
    base = base.lower()
    base = re.sub(r'[\s_\(\)\[\]]+', '-', base)
    base = re.sub(r'-{2,}', '-', base)
    base = base.strip('-')
    return base + ext

directory = "messy_files"
log = {}
for f in os.listdir(directory):
    new_name = to_kebab(f)
    if new_name != f:
        os.rename(os.path.join(directory, f), os.path.join(directory, new_name))
        log[f] = new_name
with open("rename_log.json", "w") as fh:
    json.dump(log, fh, indent=2)
```

## Directory Listing
```bash
ls -la                          # detailed listing
find . -type f                  # all files recursively
find . -type f -name "*.md"     # filter by extension
find . -maxdepth 2 -type f      # limit depth
```

## File Search
```bash
find . -name "*pattern*"        # by name
find . -iname "*pattern*"       # case-insensitive
grep -r "keyword" .             # by content
grep -rn "keyword" . --include="*.md"  # with line numbers, filtered
```

## Directory Analysis
```bash
# Count all files recursively
find . -type f | wc -l

# Count by extension
find . -type f | sed 's/.*\.//' | sort | uniq -c | sort -rn

# Find largest file (by content size)
find . -type f -exec wc -c {} \; | sort -rn | head -5

# Max nesting depth (macOS)
find . -type d | awk -F/ '{print NF-1}' | sort -rn | head -1

# Directory tree
tree -L 3
```

## Batch Operations
```bash
find . -name "*.md" -exec cp {} backup/ \;
find . -type f -size +1M -exec mv {} large/ \;
find . -name "*.tmp" -delete
```

## JSON Output
When producing analysis results as JSON:
- Counts should be integers
- File lists should be arrays of strings
- Use descriptive field names matching what was requested
