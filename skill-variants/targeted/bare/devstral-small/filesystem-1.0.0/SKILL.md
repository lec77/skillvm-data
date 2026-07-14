---
name: filesystem
description: Filesystem operations including batch file renaming, directory analysis, file search, and content inspection. Use for any task involving listing, searching, renaming, or analyzing files and directories.
---

# Filesystem Operations

## Batch Rename Files to Kebab-Case

Use `execute_command` to run a Python script. This is the most reliable approach.

IMPORTANT: The rename log JSON file goes in the CURRENT WORKING DIRECTORY (not inside the files directory).

```python
python3 -c "
import os, json, re

directory = 'messy_files'
log = {}
for name in os.listdir(directory):
    filepath = os.path.join(directory, name)
    if not os.path.isfile(filepath):
        continue
    # Split name and extension at the LAST dot
    if '.' in name:
        base, ext = name.rsplit('.', 1)
        ext = '.' + ext
    else:
        base, ext = name, ''
    # Lowercase
    new_base = base.lower()
    # Replace special chars with hyphens
    new_base = re.sub(r'[^a-z0-9.]', '-', new_base)
    # Collapse consecutive hyphens
    new_base = re.sub(r'-+', '-', new_base)
    # Remove leading/trailing hyphens
    new_base = new_base.strip('-')
    new_name = new_base + ext.lower()
    if name != new_name:
        os.rename(os.path.join(directory, name), os.path.join(directory, new_name))
    log[name] = new_name

with open('rename_log.json', 'w') as f:
    json.dump(log, f, indent=2)
print('Done:', len(log), 'files processed')
"
```

## Analyze Directory Tree

Use `execute_command` to run a Python script for analysis. This handles all fields in one pass.

IMPORTANT: Output search_results.json in the CURRENT WORKING DIRECTORY.
IMPORTANT: Extensions must include the leading dot (e.g., ".ts", ".json", ".md").
IMPORTANT: largest_file must be determined by actual file content byte size, not filename.

```python
python3 -c "
import os, json

root = 'project'
total_files = 0
by_extension = {}
largest_file = ''
largest_size = 0
files_with_todo = []
max_depth = 0

for dirpath, dirnames, filenames in os.walk(root):
    # Calculate depth: root itself is depth 1
    rel = os.path.relpath(dirpath, root)
    depth = 1 if rel == '.' else rel.count(os.sep) + 2
    if depth > max_depth:
        max_depth = depth
    for fname in filenames:
        total_files += 1
        fpath = os.path.join(dirpath, fname)
        # Extension with dot
        _, ext = os.path.splitext(fname)
        if ext:
            by_extension[ext] = by_extension.get(ext, 0) + 1
        # File size
        size = os.path.getsize(fpath)
        if size > largest_size:
            largest_size = size
            largest_file = fname
        # Check for TODO
        try:
            with open(fpath, 'r') as f:
                if 'TODO' in f.read():
                    files_with_todo.append(fname)
        except:
            pass

result = {
    'total_files': total_files,
    'by_extension': by_extension,
    'largest_file': largest_file,
    'files_containing_TODO': files_with_todo,
    'nested_depth': max_depth
}
with open('search_results.json', 'w') as f:
    json.dump(result, f, indent=2)
print('Done')
"
```

## Key Rules

- Always write output JSON files to the CURRENT DIRECTORY, not inside subdirectories
- Use Python scripts via execute_command for complex operations — they are more reliable than shell scripts
- The write_file content parameter must be a string, not an object
