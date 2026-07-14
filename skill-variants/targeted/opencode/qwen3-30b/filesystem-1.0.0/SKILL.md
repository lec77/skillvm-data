---
name: filesystem
description: Filesystem operations for directory analysis, file searching, and batch rename/processing. Use when you need to: analyze directory structures, count files, search content, batch rename files, or perform bulk file operations.
---

# Filesystem Operations

## CRITICAL RULES

1. For filesystem tasks, write a Python script file using the write tool, then run it with bash.
2. Output JSON files go in the CURRENT WORKING DIRECTORY, not inside subdirectories.
3. Use json.dump() to produce valid JSON.
4. Do NOT use regex. Use simple string replace() and translate() instead.

## Directory Analysis

Write this exact code to a file called analyze.py and run it with python3 analyze.py:

```python
import os, json

target = "project"

all_files = []
for root, dirs, files in os.walk(target):
    for f in files:
        all_files.append(os.path.join(root, f))

total_files = len(all_files)

by_ext = {}
for fp in all_files:
    name = os.path.basename(fp)
    if '.' in name and not name.startswith('.'):
        ext = "." + name.rsplit('.', 1)[1]
    else:
        ext = ""
    by_ext[ext] = by_ext.get(ext, 0) + 1

largest = max(all_files, key=lambda f: os.path.getsize(f))
largest_name = os.path.basename(largest)

search_term = "TODO"
containing = []
for fp in all_files:
    try:
        with open(fp, 'r', errors='ignore') as fh:
            if search_term in fh.read():
                containing.append(os.path.basename(fp))
    except:
        pass

max_depth = 1
for root, dirs, files in os.walk(target):
    rel = os.path.relpath(root, target)
    depth = 1 if rel == '.' else len(rel.split(os.sep)) + 1
    max_depth = max(max_depth, depth)

result = {
    "total_files": total_files,
    "by_extension": by_ext,
    "largest_file": largest_name,
    "files_containing_TODO": containing,
    "nested_depth": max_depth
}
with open("search_results.json", "w") as f:
    json.dump(result, f, indent=2)
print("Done")
```

## Batch Rename to Kebab-Case

Write this exact code to a file called rename.py and run it with python3 rename.py:

```python
import os, json

def to_kebab(filename):
    dot_pos = filename.rfind('.')
    if dot_pos > 0:
        name = filename[:dot_pos]
        ext = filename[dot_pos:]
    else:
        name = filename
        ext = ""
    name = name.lower()
    result = ""
    for ch in name:
        if ch.isalnum() or ch == '.':
            result += ch
        else:
            result += "-"
    while "--" in result:
        result = result.replace("--", "-")
    result = result.strip("-")
    return result + ext.lower()

directory = "messy_files"
rename_log = {}
for filename in sorted(os.listdir(directory)):
    filepath = os.path.join(directory, filename)
    if os.path.isfile(filepath):
        new_name = to_kebab(filename)
        rename_log[filename] = new_name
        if new_name != filename:
            os.rename(filepath, os.path.join(directory, new_name))

with open("rename_log.json", "w") as f:
    json.dump(rename_log, f, indent=2)
print("Done")
```

This approach avoids regex. It replaces any non-alphanumeric character (except dots) with a hyphen, collapses consecutive hyphens, and strips leading/trailing hyphens.

## Key Points
- os.walk() finds ALL files including dotfiles like .gitignore
- os.path.getsize() returns file size in bytes
- For extensions: .gitignore has extension "", foo.test.ts has extension ".ts"
- Directory depth: target_dir itself is depth 1, target/sub is depth 2
- Output files go in current working directory
