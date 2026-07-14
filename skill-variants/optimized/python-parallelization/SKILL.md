---
name: python-parallelization
description: Transform sequential Python code into parallel implementations using multiprocessing or concurrent.futures. Use when parallelizing CPU-bound loops, batch file processing, or data pipelines.
---

# Python Parallelization

IMPORTANT WORKFLOW:
1. Write the Python script immediately — do NOT read input files first.
2. Use `python3` to run the script (not `python`).
3. The script handles file I/O internally — never read data files with tools.

## Quick Reference

| Workload | Use | Order preserved? |
|---|---|---|
| CPU-bound | `multiprocessing.Pool` | `pool.map`/`starmap`: yes |
| I/O-bound | `asyncio` / `threading` | N/A |
| Either | `concurrent.futures` | `.map`: yes, `as_completed`: no |

## Core Pattern: multiprocessing.Pool

```python
from multiprocessing import Pool

def worker(item):
    # Process one item, return result
    return result

if __name__ == '__main__':
    with Pool() as pool:  # defaults to cpu_count() workers
        results = pool.map(worker, items)  # ordered results
```

- `pool.map(fn, items)` — ordered, simplest API
- `pool.starmap(fn, [(a,b), ...])` — multiple args per call
- Always use context manager (`with Pool() as pool:`)
- Always use `if __name__ == '__main__':` guard

## Critical: No Shared Mutable State

Each process has its own memory. Return data from workers; collect in parent.

```python
# WRONG — mutates a copy, not the original
shared = []
def worker(x):
    shared.append(x)

# RIGHT — return data, collect in parent
def worker(x):
    return x * 2

with Pool() as pool:
    results = pool.map(worker, items)
```

## Pattern: File Checksums

```python
import hashlib, json, os
from multiprocessing import Pool

def checksum_file(path):
    h = hashlib.sha256()
    with open(path, 'rb') as f:
        h.update(f.read())
    return path, h.hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        results = pool.map(checksum_file, files)
    with open('checksums.json', 'w') as f:
        json.dump(dict(results), f, sort_keys=True)
```

## Pattern: Merging Dicts from Workers

```python
import json, os
from collections import Counter
from multiprocessing import Pool

def count_words(path):
    with open(path) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.txt'))
    with Pool() as pool:
        counters = pool.map(count_words, files)
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f)
```

## Key Rules

- Read files inside worker functions — pass paths, not data
- Use `'rb'` for binary files, `'r'` for text
- Use `sort_keys=True` in `json.dump()` when sorted output needed
- For word counting, use `f.read().split()` — do NOT use regex or `.lower()`
- Exceptions in `pool.map` propagate to parent automatically
