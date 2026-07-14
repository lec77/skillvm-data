---
name: filesystem
description: Filesystem operations — directory listing, file search, batch processing, directory analysis. Use for listing contents, searching by name/content, analyzing structures, batch rename/copy/move/delete, and size analysis.
---

# Filesystem Operations

## Analyze a Directory Tree

To analyze a directory, use shell commands and write results as JSON.

### Count all files recursively
```bash
find project/ -type f | wc -l
```

### Count files by extension
```bash
find project/ -type f | sed 's/.*\./\./' | sort | uniq -c
```
For files without an extension (like `.gitignore`), handle them separately.

### Find the largest file
```bash
find project/ -type f -exec wc -c {} + | sort -n | tail -2
```
The largest file is the one with the most bytes. Report just the filename (no path).

### Search file contents
```bash
grep -rl "SEARCH_TERM" project/
```
Returns filenames containing the term. Report just filenames, not paths.

### Compute max directory depth
Count nesting levels. If `project/` is depth 1, `project/sub/` is depth 2, etc:
```bash
find project/ -type d | awk -F/ '{print NF}' | sort -n | tail -1
```

### Write JSON output
Always write results as valid JSON using a script or heredoc:
```bash
cat > output.json << 'ENDJSON'
{
  "key": "value"
}
ENDJSON
```

## Batch Rename Files

To rename files to kebab-case:

1. **Rules**: lowercase all, replace spaces/underscores/parentheses/brackets/special chars with hyphens BUT preserve dots (periods) in the name, collapse consecutive hyphens to one, remove leading/trailing hyphens from the name (keep extension).

2. **IMPORTANT**: Do NOT create temporary scripts or files inside the target directory. Work from the parent directory or use inline commands.

3. **Implementation** — use Python for reliable renaming with JSON output:
```python
import os, json, re

target_dir = "messy_files"
log = {}
for name in os.listdir(target_dir):
    filepath = os.path.join(target_dir, name)
    if not os.path.isfile(filepath):
        continue
    # Split into stem and extension at last dot
    dot_idx = name.rfind(".")
    if dot_idx > 0:
        stem, ext = name[:dot_idx], name[dot_idx:]
    else:
        stem, ext = name, ""
    # Lowercase the stem
    new_stem = stem.lower()
    # Replace special chars (but NOT dots/periods) with hyphens
    new_stem = re.sub(r'[^a-z0-9.]', '-', new_stem)
    # Collapse consecutive hyphens
    new_stem = re.sub(r'-{2,}', '-', new_stem)
    # Remove leading/trailing hyphens
    new_stem = new_stem.strip('-')
    new_name = new_stem + ext.lower()
    if name != new_name:
        os.rename(filepath, os.path.join(target_dir, new_name))
    log[name] = new_name

with open("rename_log.json", "w") as f:
    json.dump(log, f, indent=2)
```

4. **Key**: dots within filenames like "v3.1" must be preserved → "v3.1" not "v3-1". Only the last dot separates name from extension.

## Key Patterns

- Use `find` for recursive file discovery
- Use `grep -rl` for content search
- Use `wc -c` for file sizes (byte count)
- Always output valid JSON — use proper quoting and escaping
- When reporting filenames, use just the basename (no directory path)
