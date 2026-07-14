---
name: python-parallelization
description: Transform sequential Python into parallel code using multiprocessing.Pool or ProcessPoolExecutor.
---

# Python Parallelization

Use `multiprocessing.Pool` for CPU-bound parallel work. Always use context managers and `if __name__ == '__main__':` guard.

## Core Pattern: pool.map

```python
import json
from multiprocessing import Pool

def process_one(item):
    # Pure function — no shared state, return result
    return item, compute(item)

if __name__ == '__main__':
    items = [...]
    with Pool() as pool:
        results = pool.map(process_one, items)
    # results preserves input order
```

## File Checksum Pattern

```python
import hashlib
import json
import os
from multiprocessing import Pool

def compute_checksum(filename):
    with open(filename, 'rb') as f:
        return filename, hashlib.sha256(f.read()).hexdigest()

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.bin'))
    with Pool() as pool:
        pairs = pool.map(compute_checksum, files)
    result = dict(sorted(pairs))
    with open('checksums.json', 'w') as f:
        json.dump(result, f, indent=2)
```

## Word Count Pattern

```python
import json
import os
from collections import Counter
from multiprocessing import Pool

def count_file(path):
    with open(path) as f:
        return Counter(f.read().split())

if __name__ == '__main__':
    files = sorted(f for f in os.listdir('.') if f.endswith('.txt'))
    with Pool() as pool:
        counters = pool.map(count_file, files)
    total = Counter()
    for c in counters:
        total.update(c)
    with open('word_counts.json', 'w') as f:
        json.dump(dict(total), f, indent=2)
```

## Rules

- `pool.map(fn, items)` preserves input order — use it by default
- Each worker gets a **copy** of memory — never mutate shared state
- Return data from workers, merge in the parent process
- Use `Counter.update()` to merge frequency dicts
- Read files inside the worker, pass only filenames
- Use `'rb'` mode for binary files, default mode for text
- Use `f.read().split()` for word tokenization (whitespace split)
- Always write JSON output with `json.dump()`
