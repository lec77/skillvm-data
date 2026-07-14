---
name: filesystem
description: Filesystem operations - directory listing, content search, batch processing, directory analysis. Use for file search, rename, analysis, and batch operations.
---

# Filesystem Operations

## CRITICAL: Always use python3 scripts for filesystem tasks. Never use shell commands like find/grep/du for complex operations.

## CRITICAL: Write output JSON files to the CURRENT WORKING DIRECTORY, not inside subdirectories.

## Directory Analysis

To analyze a directory tree and produce a JSON report, write this EXACT script to a .py file and run it with `python3`:

```python
import os, json
from collections import defaultdict

root_dir = "project"  # CHANGE THIS to match the target directory
total = 0
exts = defaultdict(int)
largest_name = ""
largest_size = 0
todos = []
max_depth = 0

for dirpath, dirs, files in os.walk(root_dir):
    rel = os.path.relpath(dirpath, root_dir)
    depth = 1 if rel == "." else rel.count(os.sep) + 2
    if depth > max_depth:
        max_depth = depth
    for f in files:
        total += 1
        fp = os.path.join(dirpath, f)
        _, ext = os.path.splitext(f)
        exts[ext if ext else ""] += 1
        size = os.path.getsize(fp)
        if size > largest_size:
            largest_size = size
            largest_name = f
        try:
            with open(fp, "r") as fh:
                if "TODO" in fh.read():
                    todos.append(f)
        except:
            pass

result = {
    "total_files": total,
    "by_extension": dict(exts),
    "largest_file": largest_name,
    "files_containing_TODO": todos,
    "nested_depth": max_depth
}
with open("search_results.json", "w") as out:
    json.dump(result, out, indent=2)
print("Done")
```

Run with: `python3 script.py`

Depth rules: target directory = depth 1, each subdirectory adds 1.
Return just filenames not paths. Use os.path.getsize for file size (NOT du).

## Batch Rename Files

To rename files to kebab-case, write this EXACT script and run with `python3`:

```python
import os, re, json

def to_kebab(name):
    base, ext = os.path.splitext(name)
    base = base.lower()
    # Step 1: replace underscores with hyphens
    base = base.replace('_', '-')
    # Step 2: replace spaces, parentheses, brackets, braces with hyphens
    base = re.sub(r'[\s\(\)\[\]\{\}]+', '-', base)
    # Step 3: collapse consecutive hyphens into one
    base = re.sub(r'-+', '-', base)
    # Step 4: remove leading/trailing hyphens
    base = base.strip('-')
    return base + ext.lower()

directory = "messy_files"  # CHANGE THIS to match the target directory
log = {}
for f in sorted(os.listdir(directory)):
    new_name = to_kebab(f)
    old_path = os.path.join(directory, f)
    new_path = os.path.join(directory, new_name)
    if f != new_name:
        os.rename(old_path, new_path)
    log[f] = new_name

with open("rename_log.json", "w") as fh:
    json.dump(log, fh, indent=2)
print("Done")
```

Run with: `python3 script.py`

IMPORTANT: Underscores MUST be replaced with hyphens. "config_FILE.yaml" must become "config-file.yaml", NOT "config_file.yaml". The script above handles this with `base.replace('_', '-')` in Step 1.
