---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing, concurrent.futures, or asyncio. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

## IMPORTANT WORKFLOW

1. Write the Python script to the SAME directory where the input data files are located
2. Run with `python3 script_name.py` from that same directory — the script uses relative paths for glob and file I/O
3. Always include `if __name__ == '__main__':` guard — required on macOS/Windows
4. Use `os.path.basename(filepath)` to extract just the filename when building output dicts — never include directory paths as keys

## Quick Reference

| Workload | Use | Why |
|---|---|---|
| CPU-bound | `multiprocessing.Pool` | Bypasses GIL |
| I/O-bound | `asyncio` / `threading` | No need for multiple cores |
| Mixed | `concurrent.futures` | Unified API |

## Core Pattern: multiprocessing.Pool

```python
from multiprocessing import Pool

def process_item(item):
    # do work, return result
    return result

if __name__ == '__main__':
    items = [...]
    with Pool() as pool:
        results = pool.map(process_item, items)
```

`pool.map` preserves input order. Always use context manager (`with`).

## Pattern: File Checksums

```python
import hashlib, json, glob

def compute_checksum(filepath):
    import os
    with open(filepath, 'rb') as f:
        return os.path.basename(filepath), hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    from multiprocessing import Pool
    files = sorted(glob.glob('data_*.bin'))
    with Pool() as pool:
        results = dict(pool.map(compute_checksum, files))
    # Sort by filename for output
    sorted_results = dict(sorted(results.items()))
    with open('checksums.json', 'w') as f:
        json.dump(sorted_results, f, sort_keys=True)
```

- Open binary files with `'rb'` mode
- Use `sort_keys=True` in `json.dump` for sorted output
- Return `(filename, value)` tuples, convert to dict

## Pattern: Word Counting with Merge

```python
import json, glob
from collections import Counter
from multiprocessing import Pool

def count_words(filepath):
    with open(filepath) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(glob.glob('text_*.txt'))
    with Pool() as pool:
        counters = pool.map(count_words, files)
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f)
```

- Use `f.read().split()` for word splitting — do NOT use regex, `.lower()`, or `.strip()` on words
- Merge with `Counter.update()` in the parent process
- Do NOT use `sort_keys=True` for word count output — preserve Counter insertion order

## Key Rules

- Each worker reads its own files — pass file paths, not data
- Binary files: always open with `'rb'`
- Text files: use `f.read().split()` exactly — no `.lower()`, no regex, no punctuation stripping
- Use `json.dump(data, f, sort_keys=True)` only when sorted output is explicitly required (checksums yes, word counts no)
- Output JSON keys must be bare filenames (e.g. `data_00.bin`), not paths — use `os.path.basename()`
- `pool.map` preserves order; `as_completed` does not
- Always guard with `if __name__ == '__main__':`
- Run the script in the same directory as the data files
