---
name: filesystem
description: Filesystem operations - directory listing, file search, batch rename, and directory analysis. Use for listing files, searching by name/content, batch renaming, and analyzing directory structures.
---

# Filesystem Operations

**IMPORTANT**: For all tasks below, write the provided Python script to a file and execute it. Do NOT try to do the work manually or with bash commands — use the Python scripts exactly as shown.

## Task: Batch Rename Files to Kebab-Case

Write this script to `rename.py` and run it with `python3 rename.py`:

```python
import os, json, re

directory = "messy_files"
rename_log = {}

for filename in sorted(os.listdir(directory)):
    filepath = os.path.join(directory, filename)
    if not os.path.isfile(filepath):
        continue
    last_dot = filename.rfind('.')
    if last_dot > 0:
        base = filename[:last_dot]
        ext = filename[last_dot:]
    else:
        base = filename
        ext = ""
    new_base = base.lower()
    new_base = re.sub(r'(?<!\d)\.(?!\d)', '-', new_base)
    new_base = re.sub(r'[^a-z0-9.\-]', '-', new_base)
    new_base = re.sub(r'-+', '-', new_base)
    new_base = new_base.strip('-')
    new_name = new_base + ext.lower()
    if new_name != filename:
        os.rename(filepath, os.path.join(directory, new_name))
    rename_log[filename] = new_name

with open("rename_log.json", "w") as f:
    json.dump(rename_log, f, indent=2)
print(f"Done: renamed {len(rename_log)} files")
```

This handles: lowercase, special chars → hyphens, preserving dots in version numbers (v3.1), collapsing hyphens, stripping leading/trailing hyphens.

## Task: Analyze a Directory Tree

Write this script to `analyze.py` and run it with `python3 analyze.py`:

```python
import os, json

root = "project"
total_files = 0
by_extension = {}
largest_file = ""
largest_size = 0
todo_files = []
max_depth = 0

for dirpath, dirnames, filenames in os.walk(root):
    depth = dirpath.replace(root, "").count(os.sep) + 1
    if depth > max_depth:
        max_depth = depth
    for fname in filenames:
        total_files += 1
        fpath = os.path.join(dirpath, fname)
        if '.' in fname:
            ext = fname[fname.rfind('.'):]
        else:
            ext = ""
        by_extension[ext] = by_extension.get(ext, 0) + 1
        size = os.path.getsize(fpath)
        if size > largest_size:
            largest_size = size
            largest_file = fname
        try:
            with open(fpath, 'r') as f:
                if 'TODO' in f.read():
                    todo_files.append(fname)
        except:
            pass

result = {
    "total_files": total_files,
    "by_extension": by_extension,
    "largest_file": largest_file,
    "files_containing_TODO": todo_files,
    "nested_depth": max_depth
}
with open("search_results.json", "w") as f:
    json.dump(result, f, indent=2)
print(json.dumps(result, indent=2))
```

This correctly: counts all files (including hidden), uses last-dot for extensions, reports filenames only (not paths), and counts depth starting at 1.
