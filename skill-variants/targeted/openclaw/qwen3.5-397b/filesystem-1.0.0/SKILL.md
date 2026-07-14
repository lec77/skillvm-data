---
name: filesystem
description: Advanced filesystem operations for listing files, searching content, batch processing, and directory analysis. Supports recursive search, file type filtering, size analysis, and batch operations like copy/move/delete. Use when you need to: list directory contents, search for files by name or content, analyze directory structures, perform batch file operations, or analyze file sizes and distribution.
---

# Filesystem Operations

## Critical Rules

1. **Always use relative paths** when writing output files. Write to `./filename` not `/absolute/path/filename`. The working directory is your workspace root.
2. **Write JSON output using a script** (Python or bash heredoc), never by assembling strings from shell fragments.
3. Break complex tasks into discrete steps. Verify each step before proceeding.

## Batch Rename to Kebab-Case

The safest approach: use a Python script that handles all edge cases in one pass.

```python
#!/usr/bin/env python3
import os, json, re

src_dir = "messy_files"  # or whatever the target directory is
mapping = {}

for old_name in os.listdir(src_dir):
    old_path = os.path.join(src_dir, old_name)
    if not os.path.isfile(old_path):
        continue

    # Split on LAST dot for extension
    if '.' in old_name:
        name_part, ext = old_name.rsplit('.', 1)
        ext = '.' + ext.lower()
    else:
        name_part, ext = old_name, ''

    # Lowercase, replace special chars with hyphens
    new_name = name_part.lower()
    new_name = re.sub(r'[\s_(){}\[\]]', '-', new_name)
    new_name = re.sub(r'[^a-z0-9.\-]', '-', new_name)
    new_name = re.sub(r'-+', '-', new_name)  # collapse consecutive hyphens
    new_name = new_name.strip('-')  # remove leading/trailing hyphens

    new_full = new_name + ext
    mapping[old_name] = new_full

    if old_name != new_full:
        os.rename(old_path, os.path.join(src_dir, new_full))

# Write log to CURRENT DIRECTORY (relative path!)
with open("rename_log.json", "w") as f:
    json.dump(mapping, f, indent=2)
```

Key points:
- Dots within filenames (like `v3.1` in `CHANGELOG (v3.1).md`) are preserved — only the last dot separates the extension
- Replace spaces, underscores, parentheses `()`, brackets `[]`, braces `{}` with hyphens
- Collapse multiple consecutive hyphens into one
- Strip leading/trailing hyphens from the name portion
- Output the mapping JSON to the **current working directory** using a relative path

## Directory Analysis & Search

For tasks requiring structured analysis of a directory tree, write a Python script:

```python
#!/usr/bin/env python3
import os, json

root = "project"  # target directory
total_files = 0
by_extension = {}
largest_file = ("", 0)
files_with_pattern = []
max_depth = 1  # root dir itself is depth 1

for dirpath, dirnames, filenames in os.walk(root):
    # Calculate depth relative to root directory.
    # root itself = depth 1. A subdirectory "src" has rel="src", 0 separators, depth=2.
    # "src/utils" has 1 separator, depth=3. "src/utils/helpers" has 2 separators, depth=4.
    # Formula: number_of_separators + 2 (NOT +1, because depth starts at 1 for root,
    # and a single-component relative path like "src" has 0 separators but is depth 2).
    rel = os.path.relpath(dirpath, root)
    depth = 1 if rel == '.' else rel.count(os.sep) + 2  # +2 is correct, do NOT change to +1
    if depth > max_depth:
        max_depth = depth

    for fname in filenames:
        total_files += 1
        fpath = os.path.join(dirpath, fname)

        # Extension (with leading dot)
        _, ext = os.path.splitext(fname)
        if ext:
            by_extension[ext] = by_extension.get(ext, 0) + 1

        # Largest file by content size
        try:
            size = os.path.getsize(fpath)
            if size > largest_file[1]:
                largest_file = (fname, size)
        except:
            pass

        # Content search
        try:
            with open(fpath, 'r', errors='ignore') as f:
                if "TODO" in f.read():
                    files_with_pattern.append(fname)
        except:
            pass

result = {
    "total_files": total_files,
    "by_extension": by_extension,
    "largest_file": largest_file[0],
    "files_containing_TODO": files_with_pattern,
    "nested_depth": max_depth
}

# Write to CURRENT DIRECTORY (relative path!)
with open("search_results.json", "w") as f:
    json.dump(result, f, indent=2)
```

## Shell Commands Reference

### Listing & Searching
```bash
find <dir> -type f                    # all files recursively
find <dir> -type f -name "*.md"       # filter by extension
grep -rl "PATTERN" <dir>              # files containing string
grep -rn "PATTERN" <dir>              # with line numbers
```

### File Info
```bash
find <dir> -type f -exec wc -c {} +   # file sizes
du -h --max-depth=1 <dir> | sort -hr  # directory sizes
```

### Batch Operations
```bash
# Rename with loop
for file in <dir>/*; do
  mv -- "$file" "$(dirname "$file")/newname"
done

# Delete by pattern
find <dir> -name "*.tmp" -delete
```

## Safety
- List targets before destructive operations
- Log old→new mapping before executing renames
- Use `mv` for renames (preserves content)
