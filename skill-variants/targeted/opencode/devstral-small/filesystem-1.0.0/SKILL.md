---
name: filesystem
description: Advanced filesystem operations for listing files, searching content, batch processing, and directory analysis. Supports recursive search, file type filtering, size analysis, and batch operations like copy/move/delete. Use when you need to: list directory contents, search for files by name or content, analyze directory structures, perform batch file operations, or analyze file sizes and distribution.
---

# Filesystem Operations

## Critical Rules

- ALWAYS save output files (JSON, logs, reports) to the CURRENT WORKING DIRECTORY, NOT inside the source directory being analyzed. If asked to analyze `project/` and produce `results.json`, save to `./results.json`, NOT `project/results.json`.
- When using the `write` tool, the `content` parameter MUST be a string. For JSON output, use `JSON.stringify(obj, null, 2)` or pass the JSON as a string literal. NEVER pass a JavaScript object directly.
- Use `bash` tool with a Python script for complex multi-step filesystem operations. Python is more reliable for string manipulation and JSON generation than chaining shell commands.

## Task: Batch Rename Files to Kebab-Case

When renaming files to kebab-case, use this exact procedure via `bash` with `python3`:

```python
import os, re, json

def to_kebab(filename):
    name, ext = os.path.splitext(filename)
    # lowercase, replace special chars (NOT dots) with hyphens
    result = re.sub(r'[^a-z0-9.]+', '-', name.lower())
    # collapse consecutive hyphens
    result = re.sub(r'-+', '-', result)
    # remove leading/trailing hyphens
    result = result.strip('-')
    return result + ext

directory = 'messy_files'  # adjust as needed
log = {}
for f in os.listdir(directory):
    old = os.path.join(directory, f)
    if os.path.isfile(old):
        new_name = to_kebab(f)
        os.rename(old, os.path.join(directory, new_name))
        log[f] = new_name

with open('rename_log.json', 'w') as fh:
    json.dump(log, fh, indent=2)
```

Key rules for kebab-case conversion:
- Replace spaces, underscores `_`, parentheses `()`, brackets `[]`, and other special chars with hyphens
- KEEP dots `.` in the name part (e.g., `v3.1` stays `v3.1`, NOT `v3-1`)
- The regex must be `[^a-z0-9.]+` (note the dot is INCLUDED in allowed chars)
- Collapse consecutive hyphens `--` into single `-`
- Remove leading/trailing hyphens
- Keep the file extension unchanged

Examples:
| Input | Output |
|-------|--------|
| `Report (Final).txt` | `report-final.txt` |
| `CHANGELOG (v3.1).md` | `changelog-v3.1.md` |
| `data[v2].csv` | `data-v2.csv` |
| `test_RESULTS_Final (1).json` | `test-results-final-1.json` |
| `API_Response [raw].json` | `api-response-raw.json` |

## Task: Analyze Directory Tree

When analyzing a directory and producing a JSON report, use `bash` with `python3`:

```python
import os, json

target = 'project'  # adjust as needed
total = 0
ext_counts = {}
largest_file = ''
largest_size = 0
todo_files = []
max_depth = 0

for root, dirs, files in os.walk(target):
    # Calculate depth: target/ = 1, target/sub/ = 2, etc.
    depth = root.replace(target, '').count(os.sep) + 1
    if depth > max_depth:
        max_depth = depth
    for f in files:
        total += 1
        filepath = os.path.join(root, f)
        # Extension: last dot to end. Files like .gitignore have no ext.
        _, ext = os.path.splitext(f)
        if ext:
            ext_counts[ext] = ext_counts.get(ext, 0) + 1
        # Find largest by content length
        size = os.path.getsize(filepath)
        if size > largest_size:
            largest_size = size
            largest_file = f
        # Check for TODO in content
        try:
            with open(filepath, 'r', errors='ignore') as fh:
                if 'TODO' in fh.read():
                    todo_files.append(f)
        except:
            pass

result = {
    'total_files': total,
    'by_extension': ext_counts,
    'largest_file': largest_file,
    'files_containing_TODO': todo_files,
    'nested_depth': max_depth
}

# IMPORTANT: save to current directory, NOT inside target directory
with open('search_results.json', 'w') as fh:
    json.dump(result, fh, indent=2)
```

Key rules:
- `total_files`: count ALL files recursively (not directories)
- `by_extension`: use the file's last extension (`.ts`, `.json`, `.md`). Files like `.gitignore` with no extension can be omitted or counted as empty string
- `largest_file`: just the filename, not the full path. Compare by file size (bytes)
- `files_containing_TODO`: just filenames (not paths) of files containing the literal string `TODO`
- `nested_depth`: the root directory counts as depth 1. Each subdirectory level adds 1
- ALWAYS save the output JSON to the current working directory

## General Filesystem Commands

### List files
```bash
ls -la                           # detailed listing
find . -type f -name "*.md"      # find by extension
find . -maxdepth 2 -type f       # limit depth
```

### Search content
```bash
grep -r "keyword" .              # recursive search
grep -rn "keyword" . --include="*.ts"  # with line numbers, filtered
grep -rl "TODO" directory/       # list files containing string
```

### Count and analyze
```bash
find . -type f | wc -l                              # total file count
find . -type f | sed 's/.*\.//' | sort | uniq -c     # count by extension
find . -type f -exec wc -c {} + | sort -n | tail -5  # largest files
```

### Batch operations
```bash
# Batch copy
find . -name "*.md" -exec cp {} backup/ \;
# Batch delete
find . -name "*.tmp" -delete
# Batch move
find . -name "*.log" -exec mv {} logs/ \;
```
