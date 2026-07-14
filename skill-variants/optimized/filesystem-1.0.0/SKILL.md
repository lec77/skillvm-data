---
name: filesystem
description: Advanced filesystem operations for listing files, searching content, batch processing, and directory analysis. Supports recursive search, file type filtering, size analysis, and batch operations like copy/move/delete. Use when you need to: list directory contents, search for files by name or content, analyze directory structures, perform batch file operations, or analyze file sizes and distribution.
---

# Filesystem Operations

## Approach

Break complex filesystem tasks into discrete steps. Run each step separately and verify output before proceeding — piping everything into one command makes debugging impossible when something goes wrong.

For tasks that produce structured output (JSON, CSV), write a short script rather than assembling output from shell command fragments. Scripts handle quoting, escaping, and edge cases more reliably.

## File Counting & Extension Analysis

Use `find <dir> -type f` as the foundation. Key decisions:

- **Hidden files** (`.gitignore`, `.env`): `find` includes them by default. Decide whether they count and be consistent.
- **Extension extraction**: Use the last dot only. `file.test.ts` → `.ts`. Files like `.gitignore` (dot-prefixed, no second dot) have no conventional extension — categorize them explicitly.
- **Dot-prefix convention**: Report extensions as `.ts`, `.json` (with leading dot) unless told otherwise.

```bash
# Reliable extension breakdown
find <dir> -type f -print0 | while IFS= read -r -d '' f; do
  base=$(basename "$f")
  case "$base" in
    .*.*) echo ".${base##*.}" ;;   # .foo.bar → .bar
    .*)   echo "(dotfile)" ;;       # .gitignore → no ext
    *.*)  echo ".${base##*.}" ;;   # file.ts → .ts
    *)    echo "(none)" ;;          # no dot at all
  esac
done | sort | uniq -c | sort -rn
```

## Finding Largest Files

"Largest" usually means file size (bytes). If the prompt says "most content," measure character count with `wc -c` instead.

```bash
# By byte size — return just the filename
find <dir> -type f -exec wc -c {} + | sort -rn | head -5
```

Always return just the filename (`basename`), not the full path, unless asked otherwise.

## Content Search

```bash
# Files containing a literal string — filenames only
grep -rl "PATTERN" <dir>
```

`grep -r` is case-sensitive by default. Only add `-i` if the task asks for case-insensitive matching. Return basenames if the task says "filenames."

## Directory Depth

Define depth relative to the target directory: the root dir itself is depth 1, immediate subdirs are depth 2, etc.

```bash
# Max depth: count path components relative to root
find <dir> -type d | sed "s|^<dir>/||" | awk -F/ '{print NF + 1}' | sort -rn | head -1
```

## Batch Rename

Renaming is where edge cases accumulate. The safe pattern:

1. **Capture the original filenames** before any changes
2. **Compute all new names** in one pass (script or loop)
3. **Execute renames** and build a log simultaneously

For kebab-case conversion:
- Replace spaces, underscores, parentheses `()`, brackets `[]`, braces `{}` with hyphens
- **Preserve dots** that are part of content (version numbers like `v3.1`, decimal numbers) — only the dot before the final extension is structural. Split on the *last* dot to separate name from extension, then only transform the name portion.
- Collapse consecutive hyphens into one
- Strip leading/trailing hyphens from the name
- Lowercase the entire result

```bash
for file in <dir>/*; do
  base=$(basename "$file")
  # Split on LAST dot for extension
  if [[ "$base" == *.* ]]; then
    ext=".${base##*.}"
    name="${base%.*}"
  else
    ext=""
    name="$base"
  fi

  new_name=$(printf '%s' "$name" | \
    tr '[:upper:]' '[:lower:]' | \
    sed 's/[[:space:]_()[\]{}]/-/g' | \
    sed 's/--*/-/g' | \
    sed 's/^-//;s/-$//')

  new_ext=$(printf '%s' "$ext" | tr '[:upper:]' '[:lower:]')
  mv -- "$file" "$(dirname "$file")/${new_name}${new_ext}"
done
```

The critical insight: dots *within* the filename (like `CHANGELOG (v3.1).md`) should become part of the kebab name (`changelog-v3.1.md`), not be replaced with hyphens. Only the final extension dot is structural.

## Duplicate Detection

Hash file contents and group by hash. Use `md5` (macOS) or `md5sum` (Linux):

```bash
find <dir> -type f -exec md5 -r {} + 2>/dev/null || find <dir> -type f -exec md5sum {} +
```

For structured output, write a Python or Node script that:
1. Walks the directory tree
2. Hashes each file
3. Groups by hash
4. Filters to groups with 2+ members
5. Outputs JSON with relative paths

## Producing JSON

For any task requiring JSON output, prefer writing a script over shell string concatenation. Python's `json.dump()` or Node's `JSON.stringify()` handle escaping correctly and produce valid JSON every time.

```python
#!/usr/bin/env python3
import json, os, hashlib
from pathlib import Path

# ... compute your data ...

with open("output.json", "w") as f:
    json.dump(data, f, indent=2)
```

## Safety

Before destructive operations (rename, move, delete):
1. List targets first — preview what will change
2. For batch renames, log the old→new mapping before executing
3. Use `mv` for renames (preserves content); never delete-then-recreate
