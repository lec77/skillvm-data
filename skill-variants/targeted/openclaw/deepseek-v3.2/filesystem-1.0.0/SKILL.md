---
name: filesystem
description: Advanced filesystem operations for listing files, searching content, batch processing, and directory analysis. Supports recursive search, file type filtering, size analysis, and batch operations like copy/move/delete. Use when you need to: list directory contents, search for files by name or content, analyze directory structures, perform batch file operations, or analyze file sizes and distribution.
---

# Filesystem Operations

Break tasks into discrete steps. Verify each step before proceeding. For structured output (JSON), write a Python script — it handles quoting/escaping correctly.

## Directory Analysis & File Counting

Use `find <dir> -type f` as the foundation for all file operations.

**Extension extraction**: Use the LAST dot only. `file.test.ts` → `.ts`. Files like `.gitignore` have no extension — categorize explicitly.

```bash
# Count all files recursively
find <dir> -type f | wc -l

# Extension breakdown (with dot prefix)
find <dir> -type f | while IFS= read -r f; do
  base=$(basename "$f")
  case "$base" in
    .*.*) echo ".${base##*.}" ;;
    .*)   echo "(dotfile)" ;;
    *.*)  echo ".${base##*.}" ;;
    *)    echo "(none)" ;;
  esac
done | sort | uniq -c | sort -rn
```

## Finding Largest Files

"Largest" = most bytes. Use `wc -c` if "most content" is specified.

```bash
find <dir> -type f -exec wc -c {} + | sort -rn | head -5
```

Return just the filename (basename), not the full path, unless asked otherwise.

## Content Search

```bash
# Files containing a literal string — filenames only
grep -rl "PATTERN" <dir>
```

Case-sensitive by default. Only add `-i` if asked. Return basenames if "filenames" is requested.

## Directory Depth

Root dir = depth 1, immediate subdirs = depth 2, etc.

```bash
find <dir> -type d | awk -F/ '{print NF}' | sort -rn | head -1
```

Adjust the count relative to the root directory path components.

## Batch Rename to Kebab-Case

**CRITICAL: Dots within the filename (like version numbers `v3.1`) must be PRESERVED. Only the LAST dot (separating name from extension) is structural.**

Algorithm:
1. Split filename on the LAST dot → name + extension
2. Transform only the name part:
   - Replace spaces, underscores, parentheses `()`, brackets `[]`, braces `{}` with hyphens
   - **DO NOT replace dots** — they are valid in kebab-case names (e.g., `v3.1`)
   - Collapse consecutive hyphens into one
   - Strip leading/trailing hyphens
   - Lowercase everything
3. Lowercase the extension
4. Rejoin as `new_name.ext`

Use a Python script for reliability:

```python
import os, json, re

source_dir = "messy_files"
log = {}

for fname in os.listdir(source_dir):
    fpath = os.path.join(source_dir, fname)
    if not os.path.isfile(fpath):
        continue

    # Split on LAST dot for extension
    if '.' in fname:
        last_dot = fname.rfind('.')
        name = fname[:last_dot]
        ext = fname[last_dot:].lower()
    else:
        name = fname
        ext = ""

    # Transform name only (preserve dots!)
    new_name = name.lower()
    new_name = re.sub(r'[\s_\(\)\[\]\{\}]+', '-', new_name)
    new_name = re.sub(r'-+', '-', new_name)
    new_name = new_name.strip('-')

    new_fname = new_name + ext
    os.rename(fpath, os.path.join(source_dir, new_fname))
    log[fname] = new_fname

with open("rename_log.json", "w") as f:
    json.dump(log, f, indent=2)
```

Examples:
- `CHANGELOG (v3.1).md` → `changelog-v3.1.md` (dot preserved!)
- `Report (Final).txt` → `report-final.txt`
- `data[v2].csv` → `data-v2.csv`

## Producing JSON Output

Always use Python's `json.dump()` for JSON output — never assemble JSON from shell strings.

```python
import json
with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Safety

Before destructive operations:
1. List targets first — preview what will change
2. For batch renames, log the old→new mapping
3. Use `mv`/`os.rename()` (preserves content)
