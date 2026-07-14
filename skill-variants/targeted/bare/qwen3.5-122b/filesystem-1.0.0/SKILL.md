---
name: filesystem
description: "MUST LOAD THIS SKILL before any filesystem task. Critical: for kebab-case renaming, use regex [\\s_\\(\\)\\[\\]]+ to replace special chars (NOT [^a-z0-9] which destroys dots in version numbers like v3.1). Use os.path.splitext() for extension splitting. Use re.sub(r'(?<!\\d)\\.(?!\\d)', '-', name) to handle dots correctly. For directory analysis, depth starts at 1 for the target dir. Use len(content) for file size."
---

# Filesystem Operations

**IMPORTANT: Use the exact Python code patterns below. Do NOT write your own regex patterns.**

## Batch Rename to Kebab-Case

### The ONLY correct rename function

```python
def to_kebab_case(filename):
    import os, re
    name, ext = os.path.splitext(filename)
    name = name.lower()
    # Replace ONLY spaces, underscores, parens, brackets with hyphens
    name = re.sub(r'[\s_\(\)\[\]]+', '-', name)
    # Replace dots NOT between digits (preserves v3.1)
    name = re.sub(r'(?<!\d)\.(?!\d)', '-', name)
    # Collapse hyphens
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')
    return name + ext
    # DO NOT ADD MORE STEPS
```

**DO NOT use `[^a-z0-9]` or `[^a-z0-9-]`** — these destroy dots in version numbers.

Expected: `CHANGELOG (v3.1).md` → `changelog-v3.1.md` (dot preserved!)

### Complete script

```python
import os, re, json

def to_kebab_case(filename):
    name, ext = os.path.splitext(filename)
    name = name.lower()
    name = re.sub(r'[\s_\(\)\[\]]+', '-', name)
    name = re.sub(r'(?<!\d)\.(?!\d)', '-', name)
    name = re.sub(r'-+', '-', name)
    name = name.strip('-')
    return name + ext

d = "messy_files/"
log = {}
for f in os.listdir(d):
    p = os.path.join(d, f)
    if os.path.isfile(p):
        n = to_kebab_case(f)
        os.rename(p, os.path.join(d, n))
        log[f] = n
with open("rename_log.json", "w") as out:
    json.dump(log, out, indent=2)
```

## Directory Tree Analysis

```python
import os, json
from collections import defaultdict

def analyze(root):
    total = 0
    exts = defaultdict(int)
    largest = ("", 0)
    todos = []
    max_d = 0
    rd = root.rstrip('/').count('/')
    for dp, dns, fns in os.walk(root):
        d = dp.rstrip('/').count('/') - rd + 1
        if d > max_d: max_d = d
        for f in fns:
            total += 1
            fp = os.path.join(dp, f)
            _, e = os.path.splitext(f)
            exts[e if e else "(none)"] += 1
            try:
                c = open(fp).read()
                s = len(c)
                if s > largest[1]: largest = (f, s)
                if "TODO" in c: todos.append(f)
            except: pass
    return {"total_files": total, "by_extension": dict(exts), "largest_file": largest[0], "files_containing_TODO": todos, "nested_depth": max_d}

r = analyze("project/")
with open("search_results.json", "w") as f:
    json.dump(r, f, indent=2)
```

Key rules:
- Target directory = depth 1
- File size = `len(content)` (content bytes)
- Largest file = filename only (not path)
- TODO = case-sensitive string match
- Output JSON in current working directory
